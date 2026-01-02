import { Keypair } from "@solana/web3.js";
import config from "../config/config";
import { next } from "../helpers/queue";
import { takeSnapshot } from "../helpers/snapshot";
import { prisma, type Job } from "../lib/prisma";
import type { AirdropJobPayload } from "../lib/types";
import { batch } from "../lib/utils";
import { encryptionService } from "../services/encryption";
import { solanaService } from "../services/solana";
import bs58 from "bs58";

export async function airdropWorker() {
  while (true) {
    console.log("running");
    const job = await next();
    console.log("job", job);
    if (!job) {
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }

    const payload = JSON.parse(job.payload!.toString()) as AirdropJobPayload;

    const privateKey = encryptionService.decrypt(
      payload.senderKeypair.encryptedKey,
      payload.senderKeypair.iv,
      payload.senderKeypair.tag
    );

    const payer = Keypair.fromSecretKey(
      Uint8Array.from(bs58.decode(privateKey))
    );

    console.log("key", privateKey, Keypair);

    const snapshot: any = JSON.parse(job.snapshot as string);

    const batches = batch(snapshot.holders, 20).slice(job.batchIndex!);

    for (const batch of batches) {
      // await sendAirdropBatch(conn, payer, airdropMint, chunk);
      const txHash = await solanaService.sendAirdropBatch(
        payload.airdropTokenMint,
        payer,
        batch,
        6,
        snapshot.total,
        payload.totalAirdropAmount
      );

      await prisma.job.update({
        where: { id: job.id },
        data: {
          batchIndex: job.batchIndex! + 1,
          leaseUntil: new Date(Date.now() + 2 * 60 * 1000),
          txHashes: {
            push: txHash,
          },
        },
      });
    }

    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "completed",
      },
    });

    // console.log(snapshot);

    // await complet

    // try {

    // } catch (e: any) {

    // }
  }
}
