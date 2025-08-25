import { Mode, Porto } from "porto";
import { Hooks } from "porto/wagmi";
import { useEffect } from "react";
import { Button, Linking, Text, View } from "react-native";
import { riseTestnet } from "viem/chains";
import { http, useAccount, useConnectors } from "wagmi";

export default function Index() {
  const { mutate: connect, error: connectError } = Hooks.useConnect();
  const { mutate: disconnect } = Hooks.useDisconnect();
  const { address, isConnected, status } = useAccount();
  const connectors = useConnectors();

  const portoConfig = Porto.create({
    chains: [riseTestnet],
    transports: {
      [riseTestnet.id]: http(),
    },
    mode: Mode.relay({
      multichain: false,
      persistPreCalls: false,
    }),
    // add react-native storage
  });

  const connectWithPorto = async () => {
    try {
      // This will open the dialog and handle the RPC communication
      const accounts = await portoConfig.provider.request({
        method: "wallet_connect",
        // .... add params here
      });

      console.log("accounts:: ", accounts);
      return accounts;
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  const createPasskey = async () => {
    const returnUrl = "risewalletapp://passkey/auth-complete";

    // Use Porto's account creation/connection flow
    // const dialogUrl =
    //   "https://rise-wallet-testnet.vercel.app/dialog/wallet_connect";

    const dialogUrl = "https://localhost:5174/dialog/wallet_connect";

    const params = new URLSearchParams({
      returnUrl: returnUrl,
      // Add required RPC parameters
      method: "wallet_connect",
      params: JSON.stringify([
        {
          capabilities: {
            createAccount: true, // For passkey creation
            // Add other capabilities as needed
          },
        },
      ]),
    });

    const fullUrl = `${dialogUrl}?${params.toString()}`;

    // Open browser for passkey creation
    await Linking.openURL(fullUrl);
  };

  const handlePasskeyCreation = (url: string | URL) => {
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;

      const account = params.get("account");
      const keys = params.get("keys");
      const error = params.get("error");

      console.log("account:: ", account);
      console.log("keys:: ", keys);
      console.log("params:: ", params);

      if (error) {
        console.error("Passkey creation failed:", error);
        return;
      }

      if (account) {
        // Passkey created successfully
        const accountData = JSON.parse(decodeURIComponent(account));
        // Store account information

        // Navigate to authenticated state
      }
    } catch (e) {
      console.error("Error processing passkey creation:", e);
    }
  };

  useEffect(() => {
    const handleDeepLink = (url: any) => {
      handlePasskeyCreation(url);
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (connectError) console.error(connectError);
  }, [connectError]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Wallet Status
        </Text>
        <Text>Status: {status}</Text>
        <Text>Connected: {isConnected ? "Yes" : "No"}</Text>
        {address && <Text>Address: {address}</Text>}
      </View>

      <View style={{ gap: 10 }}>
        <Button
          title="Login"
          onPress={() => {
            connect({ connector: connectors[0], createAccount: false });
          }}
        />
        <Button
          title="Register"
          onPress={() => {
            // connect({ connector: connectors[0], createAccount: true });
            createPasskey();
            // connectWithPorto();
          }}
        />
        {isConnected && (
          <Button
            title="Disconnect"
            onPress={() => {
              disconnect({ connector: connectors[0] });
            }}
          />
        )}
      </View>
    </View>
  );
}
