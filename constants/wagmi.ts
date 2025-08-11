import { Mode } from "porto";
import { porto } from "porto/wagmi";
import * as passkeys from "react-native-passkeys";
import { riseTestnet, riseTestnetConfig } from "rise-wallet";
import { type ByteArray, bytesToHex } from "viem";
import { createConfig, http } from "wagmi";

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
        keystoreHost: "rise-wallet-testnet.vercel.app",
        webAuthn: {
          createFn: async (opts) => {
            if (!opts?.publicKey) return null;
            const optsNew = {
              ...opts.publicKey,
              challenge: btoa(
                bytesToHex(opts.publicKey.challenge as ByteArray),
              ),
              user: {
                ...opts.publicKey.user,
                id: btoa(bytesToHex(opts.publicKey.user.id as ByteArray)),
              },
              signal: opts.signal,
            } as const;
            console.log(JSON.stringify(optsNew, null, 2));
            const res = await passkeys.create(optsNew);
            console.log(res);
            return res;
          },
          getFn: async (opts) => {
            if (!opts?.publicKey) return null;
            return await passkeys.get({
              ...opts.publicKey,
              challenge: btoa(
                bytesToHex(opts.publicKey.challenge as ByteArray),
              ),
            });
          },
        },
      }),
    }),
  ],
});
