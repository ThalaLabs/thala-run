import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@chakra-ui/react";
import { ConnectWallet } from "./ConnectWallet";

export default function ToggleWallet() {
  const { connected, disconnect } = useWallet();

  if (connected) {
    return <Button onClick={disconnect}>Disconnect</Button>;
  }

  return <ConnectWallet />;
}
