import type { Request, Response } from "express";
import { enqueueJob } from "../helpers/queue";
import { encryptionService } from "../services/encryption";
import type { AirdropJobPayload } from "../lib/types";
import { solanaService } from "../services/solana";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { prisma } from "../lib/prisma";

export const createAirdrop = async (req: Request, res: Response) => {
  const {
    snapshot_token_mint,
    airdrop_token_mint,
    sender_keypair,
    total_airdrop_amount,
    min_holding_threshold,
    exclude_wallets,
  } = req.body;

  console.log(req.body);

  try {
    const payer = Keypair.fromSecretKey(
      Uint8Array.from(bs58.decode(sender_keypair!))
    );

    const aidropTokenBalance = await solanaService.getTokenBalance(
      airdrop_token_mint,
      payer.publicKey.toString()
    );

    if (aidropTokenBalance < total_airdrop_amount) {
      res.status(401).send({ message: "Insufficient Balance" });
    }

    const encryptedKey = encryptionService.encrypt(sender_keypair);

    const payload: AirdropJobPayload = {
      snapshotTokenMint: snapshot_token_mint,
      airdropTokenMint: airdrop_token_mint,
      senderKeypair: encryptedKey,
      totalAirdropAmount: total_airdrop_amount,
      minHoldingThreshold: min_holding_threshold,
      excludeWallets: exclude_wallets?.split(",") ?? [],
    };
    const job = await enqueueJob(payload, payer.publicKey);
    res.json({ ...job });
  } catch (error: any) {
    console.log(error);
    res.status(400).json({ message: error.message ?? error });
  }
};

export const getAirdrop = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("id", id);
    const job = await prisma.job.findFirst({ where: { id: id! } });
    res.json({
      id: job?.id,
      status: job?.status,
      snapshot: JSON.parse(job?.snapshot as any),
      transactionHashes: job?.txHashes,
    });
  } catch (error: any) {
    console.log(error);
    res.status(400).json({ message: error.message ?? error });
  }
};
