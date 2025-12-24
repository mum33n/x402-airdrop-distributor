import { PrismaClient, Prisma } from "../generated/prisma/client";

export const prisma = new PrismaClient();

export type Job = Prisma.JobModel;
