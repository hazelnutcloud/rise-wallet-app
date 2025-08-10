import { Mode } from "porto";
import { porto } from "porto/wagmi";
import * as passkeys from "react-native-passkeys";
import { riseTestnet, riseTestnetConfig } from "rise-wallet";
import { createConfig, http } from "wagmi";

const decoder = new TextDecoder();

export const wagmiConfig = createConfig({
  chains: [riseTestnet],
  transports: {
    [riseTestnet.id]: http(),
  },
  multiInjectedProviderDiscovery: false,
  connectors: [
    porto({
      ...riseTestnetConfig,
      mode: Mode.rpcServer({
        keystoreHost: "https://rise-testnet-vercel.app",
        webAuthn: {
          createFn: async (opts) => {
            if (!opts?.publicKey) return null;
            return await passkeys.create({
              ...opts.publicKey,
              challenge: decoder.decode(opts.publicKey.challenge),
              user: {
                ...opts.publicKey.user,
                id: decoder.decode(opts.publicKey.user.id),
              },
              signal: opts.signal,
            });
          },
          getFn: async (opts) => {
            if (!opts?.publicKey) return null;
            return await passkeys.get(opts.publicKey);
          },
        },
      }),
    }),
  ],
});
