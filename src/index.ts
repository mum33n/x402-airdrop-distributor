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
  paymentMiddleware(
    // "CbQWkZ22EPGzuyv6ZzP7t5u6rc4YZPMteJ1434RvW7Pb" as Address,
    "0xd7fd52209711c94a3fcc4f3aeb3668d2df829254",
    // "CbQWkZ22EPGzuyv6ZzP7t5u6rc4YZPMteJ1434RvW7Pb" as any,
    {
      "GET /test": {
        // scheme: "exact",
        price: "$0.001",
        network: "base",
        config: { mimeType: "application/json" },
      },

      "POST /airdrop": {
        // scheme: "exact",
        price: "$0.001",
        network: "base",
        config: { mimeType: "application/json" },
      },
      "GET /airdrop-status": {
        // scheme: "exact",
        price: "$0.001",
        network: "base",
        config: { mimeType: "application/json" },
      },
    },

    { url: `${config.appURL}/facilitator` as any }
    // { url: "https://x402.org/facilitator" as any }
  )
);
app.get("/test", (_, res: Response) => {
  res.json({
    message: "successful",
  });
});

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

app.post("/airdrop", createAirdrop);
app.get("/airdrop-status/:id", getAirdrop);
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  console.log(`${config.appURL}/facilitator`);
  // solanaService.getTokenBalance(
  //   "CX1snYHFkPJXE8yDNYAz1G88ApLQ3wLiuFYzdNSa1JRd",
  //   "CGkM99KyLn48sf5g2jJrfkbxTGevd34Xft2FgV3cwxf9"
  // );
  // takeSnapshot(
  //   config.heliusRPC,
  //   "CX1snYHFkPJXE8yDNYAz1G88ApLQ3wLiuFYzdNSa1JRd",
  //   0n
  // );

  // solanaService.takeSnapshot(
  //   "CX1snYHFkPJXE8yDNYAz1G88ApLQ3wLiuFYzdNSa1JRd",
  //   0n,
  //   []
  // );
});

airdropWorker();

// // takeSnapshot(
//   //   "",
//   //   "5u8S9L5dP5uh2fAjX8AUySHUhw1Zj5JYPnY2VyA1CVyt"
//   // );

//   takeSnapshot(
//     config.heliusRPC,
//     // "5u8S9L5dP5uh2fAjX8AUySHUhw1Zj5JYPnY2VyA1CVyt",
//     "V4r8PV7HFY4uprTVUqhr1iwXbm1Lhpj1wFNVQtPpump",
//     1000000n
//   );
