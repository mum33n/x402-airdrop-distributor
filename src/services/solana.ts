import {
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import config from "../config/config";
import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

class SolanaService {
  private connection: Connection;
  private rpcURL: string;

  constructor() {
    this.rpcURL = config.heliusRPC;
    this.connection = new Connection(config.heliusRPC);
  }

  async getSolBalance(address: string | PublicKey) {
    const publicKey = new PublicKey(address);

    const lamports = await this.connection.getBalance(publicKey);
    const sol = lamports / 1e9;

    return sol;
  }

  async getTokenBalance(tokenMint: string, wallet: string) {
    const mint = new PublicKey(tokenMint);
    const _wallet = new PublicKey(wallet);

    const ata = await getAssociatedTokenAddress(mint, _wallet);

    const accountInfo = await this.connection.getAccountInfo(ata);
    if (!accountInfo) {
      return 0;
    }

    const balance = await this.connection.getTokenAccountBalance(ata);
    return balance.value.uiAmount ?? 0;
  }

  async buildTx(
    tokenMint: string,
    payer: any,
    batch: any[],
    decimals: number,
    totalSnapshotToken: number,
    totalAirdropToken: number
  ) {
    const instructions: TransactionInstruction[] = [];
    const mint = new PublicKey(tokenMint);

    const payerATA = await getAssociatedTokenAddress(mint, payer.publicKey);

    //  Precompute ATAs
    const recipients = await Promise.all(
      batch.map(async (r) => ({
        owner: new PublicKey(r.holder),
        ata: await getAssociatedTokenAddress(mint, new PublicKey(r.holder)),
        amount: Math.floor(
          (r.holding / totalSnapshotToken) * totalAirdropToken * 10 ** decimals
        ),
      }))
    );

    //  Bulk fetch ATA infos
    const ataInfos = await this.connection.getMultipleAccountsInfo(
      recipients.map((r) => r.ata)
    );

    recipients.forEach((r, i) => {
      if (r.amount === 0) return;

      if (!ataInfos[i]) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
            payer.publicKey,
            r.ata,
            r.owner,
            mint
          )
        );
      }

      instructions.push(
        createTransferCheckedInstruction(
          payerATA,
          mint,
          r.ata,
          payer.publicKey,
          r.amount,
          decimals
        )
      );
    });

    const { blockhash } = await this.connection.getLatestBlockhash();

    const message = new TransactionMessage({
      payerKey: payer.publicKey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();

    return new VersionedTransaction(message);
  }

  public async sendAirdropBatch(
    mint: string,
    payer: any,
    batch: any[],
    decimals: number,
    totalSnapshotToken: number,
    totalAirdropToken: number
  ) {
    try {
      const tx = await this.buildTx(
        mint,
        payer,
        batch,
        decimals,
        totalSnapshotToken,
        totalAirdropToken
      );
      tx.sign([payer]);
      const sig = await this.connection.sendTransaction(tx);
      const hash = await this.connection.confirmTransaction(sig);

      return sig;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async takeSnapshot(
    mint: string,
    minBalance: bigint,
    excludeWallets: string[] = []
  ) {
    let cursor: string | null = null;
    const holders: any[] = [];

    const _mint = new PublicKey(mint);

    const info = await this.connection.getParsedAccountInfo(_mint);

    const decimals = (info?.value?.data as any)?.parsed?.info?.decimals ?? 6;

    do {
      const res: any = await fetch(this.rpcURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "1",
          method: "getTokenAccounts",
          params: {
            mint,
            limit: 1000,
            cursor,
          },
        }),
      }).then((r) => r.json());

      for (const acc of res?.result?.token_accounts) {
        if (excludeWallets.includes(acc.owner)) {
          continue;
        }
        const amount = acc.amount / 10 ** decimals;
        if (amount < minBalance) continue;

        holders.push({
          holder: acc.owner,
          holding: amount,
        });
      }

      cursor = res.result.cursor;
    } while (cursor);

    const total = holders.reduce((a = 0, b) => a + b.holding, 0);

    return { holders, total };
  }
}

export const solanaService = new SolanaService();
