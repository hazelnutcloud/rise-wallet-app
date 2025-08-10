import "@/utils/polyfills";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/constants/wagmi";

const client = new QueryClient();

export default function RootLayout() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={client}>
        <Stack />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
