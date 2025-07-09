import { createPaymasterEndpoint } from "@fogo/sessions-sdk/paymaster";

import { SPONSOR_KEY } from "../sponsor-key";

export const POST = await createPaymasterEndpoint({
  sponsor: SPONSOR_KEY,
  rpc: "https://testnet.fogo.io/",
});
