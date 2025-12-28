import config from "../config/config";
import { next } from "../helpers/queue";
import { takeSnapshot } from "../helpers/snapshot";
import type { AirdropJobPayload } from "../lib/types";
import { solanaService } from "../services/solana";

export async function airdropWorker() {
  while (true) {
    console.log("running");
    const job = await next();
    console.log("job", job);
    if (!job) {
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }

    console.log("Job Found");

    const payload = JSON.parse(job.payload!.toString()) as AirdropJobPayload;

    const snapshot = await solanaService.takeSnapshot(
      payload.airdropTokenMint,
      0n,
      ["DSYkcNDYvrLTYTYJPHBxq8gjXkNA4kxPUvYmajDmVCcR"]
    );
    console.log(snapshot);

    // try {

    // } catch (e: any) {

    // }
  }
}
