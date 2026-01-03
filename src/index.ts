import express, { type Response } from "express";
import config from "./config/config";
import { paymentMiddleware } from "x402-express";
import { createExpressAdapter, Facilitator } from "@x402-sovereign/core";
import { base } from "viem/chains";
import { takeSnapshot } from "./helpers/snapshot";
import { airdropWorker } from "./workers/airdrop";
import { createAirdrop, getAirdrop } from "./controllers/airdrop";
import path from "node:path";
import { solanaService } from "./services/solana";
// import { createExpressAdapter, Facilitator } from "@x402-teller/core";
import bs58 from "bs58";
import { baseRouter, solanaRouter } from "./routes";
// import { takeSnapshot } from "./helpers/snapshot";

const app = express();

app.use(express.json());

const facilitator = new Facilitator({
  evmPrivateKey: config.evmPrivateKey,
  networks: [base],
});

// const facilitator = new Facilitator({
//   // evmPrivateKey: config.evmPrivateKey,
//   solanaPrivateKey: bs58.encode(config.solPrivateKey),
//   solanaFeePayer: "8peSBoTQpczv4mkCW7eB85Ww33DaGTfwE8r2DgiqET8N",
//   networks: ["solana"],
//   payWallRouteConfig: {
//     "/test": {
//       price: "$0.001",
//       network: "solana",
//       config: { description: "Premium API access" },
//     },
//   },
//   // networks: [base],
// });

createExpressAdapter(facilitator, app, "/facilitator");

app.use(
  "/.well-known",
  express.static(path.join(process.cwd(), "src", ".well-known"), {
    setHeaders: (res, path) => {
      if (path.endsWith("apple-app-site-association")) {
        res.setHeader("Content-Type", "application/json");
      }
    },
  })
);

//routes
app.use("/solana", solanaRouter);
app.use("/base", baseRouter);
app.get("/airdrop-status/:id", getAirdrop);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

airdropWorker();
