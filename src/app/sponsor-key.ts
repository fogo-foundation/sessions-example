import { Keypair } from "@solana/web3.js";

export const SPONSOR_KEY = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(process.env.SPONSOR_KEY) as number[])
);
