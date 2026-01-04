import dotenv from "dotenv";
import bs58 from "bs58";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  heliusRPC: string;
  appURL: string;
  evmPrivateKey: string;
  solPrivateKey: Uint8Array<ArrayBufferLike>;
}

const port = Number(process.env.PORT ?? 3000);
const nodeEnv = process.env.NODE_ENV ?? "development";
const heliusRPC = process.env.HELIUS_RPC;
const evmPrivateKey = process.env.EVM_PRIVATE_KEY!;
const solPrivateKey = bs58.decode(process.env.SOL_PRIVATE_KEY!);
const appURL = process.env.APP_URL ?? `http://localhost:${port}`;

console.log("app url", appURL);

if (!heliusRPC) {
  throw "HELIUS RPC NOT PROVIDED";
}

const config: Config = {
  port,
  nodeEnv,
  heliusRPC,
  appURL,
  evmPrivateKey,
  solPrivateKey,
};

export default config;
