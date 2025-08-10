import { Hooks } from "porto/wagmi";
import { useEffect } from "react";
import { Button, Text, View } from "react-native";
import { useAccount, useConnectors } from "wagmi";

export default function Index() {
  const { mutate: connect, error: connectError } = Hooks.useConnect();
  const { mutate: disconnect } = Hooks.useDisconnect();
  const { address, isConnected, status } = useAccount();
  const connectors = useConnectors();

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
            connect({ connector: connectors[0], createAccount: true });
          }}
        />
        {isConnected && (
          <Button
            title="Disconnect"
            onPress={() => {
              disconnect();
            }}
          />
        )}
      </View>
    </View>
  );
}
