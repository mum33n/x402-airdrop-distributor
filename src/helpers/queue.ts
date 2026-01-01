import type { PublicKey } from "@solana/web3.js";
import { prisma } from "../lib/prisma";
import { type Job } from "../lib/prisma";
import type { AirdropJobPayload } from "../lib/types";
import { solanaService } from "../services/solana";

export async function enqueueJob(
  payload: AirdropJobPayload,
  senderAddress: string | PublicKey
) {
  const snapshot = await solanaService.takeSnapshot(
    payload.snapshotTokenMint,
    payload.minHoldingThreshold,
    payload.excludeWallets
  );

  const accountSolBalance = await solanaService.getSolBalance(senderAddress);
  const requiredSolBalance = 0.0021 * snapshot.holders.length;

  if (accountSolBalance < requiredSolBalance) {
    throw new Error(
      `${requiredSolBalance} is required to airdrop ${snapshot.holders.length} holders`
    );
  }
  const job = await prisma.job.create({
    data: {
      status: "queued",
      payload: JSON.stringify(payload, null, 2),
      snapshot: JSON.stringify(snapshot, null, 2),
    },
  });

  return { id: job.id, totalAdresses: snapshot.holders.length };
}

export async function next() {
  const job = await prisma.$queryRaw<Job[]>`
UPDATE "Job"
SET
  status = 'running',
  "leaseUntil" = now() + interval '2 minutes',
  "updatedAt" = now()
WHERE id = (
  SELECT id FROM "Job"
  WHERE status = 'queued'
     OR (status = 'running' AND "leaseUntil" < now())
  ORDER BY "createdAt"
  FOR UPDATE SKIP LOCKED
  LIMIT 1
)
RETURNING *;
`;

  return job[0];
}
