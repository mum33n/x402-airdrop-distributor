// snapshot/takeSnapshot.ts
import { Connection, PublicKey } from "@solana/web3.js";
// import { prisma } from "../prisma";

export async function takeSnapshot(
  url: string,
  mint: string,
  minBalance: bigint
) {
  let cursor: string | null = null;
  const holders: any[] = [];

  const connection = new Connection(url);
  const _mint = new PublicKey(mint);

  const info = await connection.getParsedAccountInfo(_mint);

  const decimals = (info?.value?.data as any).parsed.info.decimals ?? 0;

  do {
    const res: any = await fetch(url, {
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
      const amount = acc.amount / (10 * 10 ** decimals);
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

  return { holders, total };
}
