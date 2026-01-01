export interface AirdropJobPayload {
  snapshotTokenMint: any;
  airdropTokenMint: any;
  senderKeypair: {
    encryptedKey: string;
    iv: string;
    tag: string;
  };
  totalAirdropAmount: any;
  minHoldingThreshold: any;
  excludeWallets: any;
}
