"use client"

import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import { ExampleProgram } from "@fogo/sessions-idls";
import { TransactionResult } from "@fogo/sessions-sdk";
import { useSession, type EstablishedSessionState, isEstablished } from "@fogo/sessions-sdk-react";
import { getAssociatedTokenAddressSync, NATIVE_MINT, getMint } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useState } from "react";

export default () => {
  const sessionState = useSession();
  if (isEstablished(sessionState)) {
    return <TradeButton sessionState={sessionState} />
  } else {
    return "Session not established";
  }
}

const TradeButton = ({ sessionState }: { sessionState: EstablishedSessionState }) => {
  const { state, execute } = useTrade(sessionState, 0.001, NATIVE_MINT);

  return (
    <button onClick={execute} disabled={state.type === StateType.Running}>
      Trade 0.001 FOGO
    </button>
  );
}

const useTrade = (
  sessionState: EstablishedSessionState,
  amount: number,
  mint: PublicKey,
) => {
  const [state, setState] = useState<State>(State.Base());

  const execute = useCallback(() => {
    if (state.type === StateType.Running) {
      throw new AlreadyInProgressError();
    }
    setState(State.Running());
    getMint(sessionState.connection, mint)
      .then(({ decimals }) => (
        new ExampleProgram(
          new AnchorProvider(sessionState.connection, {} as Wallet, {}),
        ).methods
          .exampleTransfer(new BN(amount * Math.pow(10, decimals)))
          .accountsPartial({
            sessionKey: sessionState.sessionPublicKey,
            sink: getAssociatedTokenAddressSync(mint, sessionState.payer),
            userTokenAccount: getAssociatedTokenAddressSync(
              mint,
              sessionState.walletPublicKey,
            ),
            mint,
          })
          .instruction()
      ))
      .then((instruction) => sessionState.sendTransaction([instruction]))
      .then((result) => setState(State.Complete(result)))
      .catch((error: unknown) => {
        // eslint-disable-next-line no-console
        console.error(error);
        setState(State.ErrorState(error));
        throw error;
      });
  }, [state, sessionState, amount, mint, setState]);

  return { state, execute };
};

enum StateType {
  Base,
  Running,
  Error,
  Complete,
}

const State = {
  Base: () => ({ type: StateType.Base as const }),
  Running: () => ({ type: StateType.Running as const }),
  Complete: (result: TransactionResult) => ({ type: StateType.Complete as const, result }),
  ErrorState: (error: unknown) => ({
    type: StateType.Error as const,
    error,
  }),
};
type State = ReturnType<typeof State[keyof typeof State]>;

class AlreadyInProgressError extends Error {
  constructor() {
    super("Can't run async hook when already in progress");
    this.name = "AlreadyInProgressError";
  }
}
