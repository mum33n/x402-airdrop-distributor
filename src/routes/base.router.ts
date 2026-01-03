import { Router, type Response } from "express";
import { paymentMiddleware } from "x402-express";
import { createAirdrop, getAirdrop } from "../controllers/airdrop";
import config from "../config/config";

const router = Router();

router.use(
  paymentMiddleware(
    "0xd7fd52209711c94a3fcc4f3aeb3668d2df829254",
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
        config: {
          mimeType: "application/json",
          inputSchema: {
            bodyType: "json",
            bodyFields: {
              snapshot_token_mint: "string",
              airdrop_token_mint: "string",
              sender_keypair: "string",
              total_airdrop_amount: "number",
              min_holding_threshold: "number",
              exclude_wallets: "string",
            },
          },
        },
      },
      "GET /airdrop-status": {
        // scheme: "exact",
        price: "$0.001",
        network: "base",
        config: { mimeType: "application/json" },
      },
    },

    { url: `${config.appURL}/facilitator` as any }
    // { url: "https://pay.x402.jobs" as any }
  )
);

router.post("/airdrop", createAirdrop);
router.get("/airdrop-status/:id", getAirdrop);
router.get("/test", (_, res: Response) => {
  res.json({
    message: "successful",
  });
});

export default router;
