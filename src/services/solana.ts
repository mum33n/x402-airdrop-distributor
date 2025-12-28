import { Connection, PublicKey } from "@solana/web3.js";
import config from "../config/config";

class SolanaService {
  private connection: Connection;
  private rpcURL: string;

  constructor() {
    this.rpcURL = config.heliusRPC;
    this.connection = new Connection(config.heliusRPC);
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
    console.log(info);

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
        // console.log(acc);

        holders.push({
          holder: acc.owner,
          holding: amount,
        });
      }

      cursor = res.result.cursor;
    } while (cursor);

    const total = holders.reduce((a = 0, b) => a + b.holding, 0);
    console.log(total);

    return { holders, total };
  }
}

export const solanaService = new SolanaService();
