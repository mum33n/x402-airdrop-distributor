import { prisma } from "../lib/prisma";
import { type Job } from "../lib/prisma";
import type { AirdropJobPayload } from "../lib/types";

export async function enqueueJob(payload: AirdropJobPayload) {
  const job = await prisma.job.create({
    data: {
      status: "queued",
      payload: JSON.stringify(payload, null, 2),
    },
  });

  return job.id;
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
