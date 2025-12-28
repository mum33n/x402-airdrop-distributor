import type { Request, Response } from "express";
import { enqueueJob } from "../helpers/queue";

export const createAirdrop = async (req: Request, res: Response) => {
  const {
    snapshot_token_mint,
    airdrop_token_mint,
    sender_keypair,
    total_airdrop_amount,
    min_holding_threshold,
    exclude_wallets,
  } = req.body;

  const payload = {
    snapshotTokenMint: snapshot_token_mint,
    airdropTokenMint: airdrop_token_mint,
    senderKeypair: sender_keypair,
    totalAirdropAmount: total_airdrop_amount,
    minHoldingThreshold: min_holding_threshold,
    excludeWallets: exclude_wallets,
  };
  const jobId = await enqueueJob(payload);
  res.json({ jobId });
};
