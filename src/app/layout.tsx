import type { ReactNode } from "react";
import { FogoSessionProvider, SessionButton } from "@fogo/sessions-sdk-react";
import { NATIVE_MINT } from "@solana/spl-token";
import { SPONSOR_KEY } from "./sponsor-key";

export const metadata = {
  title: 'Next.js',
  description: 'Generated by Next.js',
}

export default ({ children, }: { children: ReactNode }) => (
  <html lang="en">
    <body>
      <FogoSessionProvider
        sponsor={SPONSOR_KEY.publicKey.toBase58()}
        paymasterUrl="/paymaster"
        domain={process.env.NODE_ENV === "production" ? undefined : "https://foo.bar"}
        endpoint="https://testnet.fogo.io/"
        tokens={[NATIVE_MINT.toBase58()]}
        defaultRequestedLimits={{
          [NATIVE_MINT.toBase58()]: 1_500_000_000n,
        }}
      >
        <header>
          <h1>Fogo Sessions Example</h1>
          <SessionButton />
        </header>
        <hr />
        <main>
          {children}
        </main>
      </FogoSessionProvider>
    </body>
  </html>
);
