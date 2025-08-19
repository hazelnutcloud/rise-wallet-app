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
        keystoreHost: "asset-pepper24bots-projects.vercel.app",
        webAuthn: {
          createFn: async (opts) => {
            if (!opts?.publicKey) return null;

            try {
              const optsNew = {
                ...opts.publicKey,
                challenge: btoa(
                  bytesToHex(opts.publicKey.challenge as ByteArray)
                ),
                // challenge: bufferToBase64URLString(
                //   opts.publicKey.challenge as ArrayBuffer
                // ),
                user: {
                  ...opts.publicKey.user,
                  id: btoa(bytesToHex(opts.publicKey.user.id as ByteArray)),
                  // id: bufferToBase64URLString(
                  //   opts.publicKey.user.id as ArrayBuffer
                  // ),
                },
                signal: opts.signal,
                excludeCredentials: [],
                timeout: 60000,
              } as const;

              console.log("credentials:: ", optsNew);
              console.log(JSON.stringify(optsNew, null, 2));
              const res = await passkeys.create(optsNew as any);
              console.log("response:: ", res);
              return res;
            } catch (e) {
              console.log("error:: ", e);
              return null;
            }
          },
          getFn: async (opts) => {
            if (!opts?.publicKey) return null;
            return await passkeys.get({
              ...opts.publicKey,
              challenge: btoa(
                bytesToHex(opts.publicKey.challenge as ByteArray)
              ),
            });
          },
        },
      }),
    }),
  ],
});
