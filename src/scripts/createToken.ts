import { Connection, Keypair, clusterApiUrl, PublicKey } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import config from "../config/config";
import fs from "fs";
import path from "path";

const payer = Keypair.fromSecretKey(Uint8Array.from(config.solPrivateKey));

const ACCOUNTS_PATH = path.join(
  process.cwd(),
  "src",
  "generated",
  "accounts.json"
);

function createAccounts(amount: number) {
  const accounts = Array.from({ length: amount }, () => {
    const kp = Keypair.generate();
    return {
      publicKey: kp.publicKey.toBase58(),
      secretKey: Array.from(kp.secretKey),
    };
  });

  fs.mkdirSync(path.dirname(ACCOUNTS_PATH), { recursive: true });
  fs.writeFileSync(ACCOUNTS_PATH, JSON.stringify(accounts, null, 2), "utf8");

  return accounts;
}

async function loadAccounts() {
  try {
    const file = fs.readFileSync(ACCOUNTS_PATH, "utf8");
    return JSON.parse(file);
  } catch {
    return createAccounts(10);
  }
}

(async () => {
  const accounts = await loadAccounts();
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // 1️⃣ Create token mint
  const mint = await createMint(connection, payer, payer.publicKey, null, 6);

  console.log("Token Mint:", mint.toBase58());

  // 2️⃣ Mint tokens to EACH wallet
  for (const acc of accounts) {
    const owner = new PublicKey(acc.publicKey);

    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      owner
    );

    await mintTo(
      connection,
      payer,
      mint,
      ata.address,
      payer.publicKey,
      100 * 10 ** 6 // 100 tokens per wallet
    );

    console.log(`Minted 100 tokens to ${owner.toBase58()}`);
  }

  console.log("✅ Distribution complete");
})();
