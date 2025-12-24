import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  heliusRPC: string;
  appURL: string;
  evmPrivateKey: string;
}

const port = Number(process.env.PORT ?? 3000);
const nodeEnv = process.env.NODE_ENV ?? "development";
const heliusRPC = process.env.HELIUS_RPC;
const evmPrivateKey = process.env.EVM_PRIVATE_KEY!;
const appURL =
  (nodeEnv === "development"
    ? process.env.APP_URL
    : `http://localhost:${port}`) ?? `http://localhost:${port}`;

if (!heliusRPC) {
  throw "HELIUS RPC NOT PROVIDED";
}

const config: Config = {
  port,
  nodeEnv,
  heliusRPC,
  appURL,
  evmPrivateKey,
};

export default config;
