import express, { type Response } from "express";
import config from "./config/config";
import { paymentMiddleware } from "x402-express";
import { createExpressAdapter, Facilitator } from "@x402-sovereign/core";
import { base } from "viem/chains";
// import { takeSnapshot } from "./helpers/snapshot";

const app = express();

app.use(express.json());

const facilitator = new Facilitator({
  evmPrivateKey: config.evmPrivateKey,
  networks: [base],
});

createExpressAdapter(facilitator, app, "/facilitator");

app.use(
  paymentMiddleware(
    // "CbQWkZ22EPGzuyv6ZzP7t5u6rc4YZPMteJ1434RvW7Pb" as Address,
    "0xd7fd52209711c94a3fcc4f3aeb3668d2df829254",
    // "CbQWkZ22EPGzuyv6ZzP7t5u6rc4YZPMteJ1434RvW7Pb" as Address,
    {
      "GET /test": {
        // scheme: "exact",
        price: "$0.001",
        network: "base-sepolia",
        config: { mimeType: "application/json" },
      },
    },
    { url: `${config.appURL}/facilitator` as any }
  )
);
app.post("/test", (_, res: Response) => {
  res.send("Paid");
});
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

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
