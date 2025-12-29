// import express, { type Response } from "express";
// import config from "./config/config";
// import { takeSnapshot } from "./helpers/snapshot";
// import { airdropWorker } from "./workers/airdrop";
// import { createAirdrop } from "./controllers/airdrop";
// import path from "node:path";
// import { paymentMiddleware } from "@x402/express";
// import { registerExactSvmScheme } from "@x402/svm/exact/server";
// // import { ExactEvmScheme } from "@x402/evm/exact/server";
// import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
// // import { createPaywall } from "@x402/paywall";
// // import { evmPaywall } from "@x402/paywall/evm";
// // import { svmPaywall } from "@x402/paywall/svm";

// // const paywall = createPaywall()
// //   .withNetwork(svmPaywall)
// //   .withConfig({
// //     appName: "My App",
// //     testnet: false,
// //   })
// //   .build();

// // import { takeSnapshot } from "./helpers/snapshot";

// const app = express();

// app.use(express.json());

// const facilitatorClient = new HTTPFacilitatorClient({
//   url: "https://www.x402.org/facilitator",
// });
// // const supported = await facilitatorClient.getSupported();
// // console.log("Supported: ", JSON.stringify(supported, null, 2));

// const server = new x402ResourceServer(facilitatorClient);
// registerExactSvmScheme(server, {
//   networks: ["solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"],
// });

// app.use(
//   paymentMiddleware(
//     {
//       "GET /test": {
//         accepts: [
//           {
//             scheme: "exact",
//             price: "$0.1",
//             network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
//             payTo: "CbQWkZ22EPGzuyv6ZzP7t5u6rc4YZPMteJ1434RvW7Pb",
//           },
//         ],
//         description: "My test App",
//         mimeType: "application/json",
//       },
//     },
//     server,
//     { testnet: true }
//   )
// );

// // "CbQWkZ22EPGzuyv6ZzP7t5u6rc4YZPMteJ1434RvW7Pb" as Address,
// // "0xd7fd52209711c94a3fcc4f3aeb3668d2df829254",
// // "CbQWkZ22EPGzuyv6ZzP7t5u6rc4YZPMteJ1434RvW7Pb" as any,
// app.get("/test", (_, res: Response) => {
//   res.send("Paid");
// });

// app.use(
//   "/.well-known",
//   express.static(path.join(process.cwd(), "src", ".well-known"), {
//     setHeaders: (res, path) => {
//       if (path.endsWith("apple-app-site-association")) {
//         res.setHeader("Content-Type", "application/json");
//       }
//     },
//   })
// );

// app.post("/airdrop", createAirdrop);
// app.listen(config.port, () => {
//   console.log(`Server is running on port ${config.port}`);
//   // takeSnapshot(
//   //   config.heliusRPC,
//   //   "CX1snYHFkPJXE8yDNYAz1G88ApLQ3wLiuFYzdNSa1JRd",
//   //   0n
//   // );
// });

// // airdropWorker();

// // // takeSnapshot(
// //   //   "",
// //   //   "5u8S9L5dP5uh2fAjX8AUySHUhw1Zj5JYPnY2VyA1CVyt"
// //   // );

// //   takeSnapshot(
// //     config.heliusRPC,
// //     // "5u8S9L5dP5uh2fAjX8AUySHUhw1Zj5JYPnY2VyA1CVyt",
// //     "V4r8PV7HFY4uprTVUqhr1iwXbm1Lhpj1wFNVQtPpump",
// //     1000000n
// //   );
