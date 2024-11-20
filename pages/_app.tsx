import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { PontemWallet } from "@pontem/wallet-adapter-plugin";
import { AptosWalletAdapterProvider, useWallet } from "@aptos-labs/wallet-adapter-react";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { MSafeWalletAdapter, MSafeWalletName } from "@msafe/aptos-wallet-adapter";
import { useEffect } from "react";
import { MSafeWallet } from "@msafe/aptos-wallet";

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = extendTheme({ config });

export default function App({ Component, pageProps }: AppProps) {
  const { connect, connected } = useWallet();
  useEffect(() => {
    if (!connected && MSafeWallet.inMSafeWallet()) {
      connect(MSafeWalletName);
    }
  }, [connected, connect]);
  return (
    <ChakraProvider theme={theme}>
      <AptosWalletAdapterProvider
        plugins={[
          new PetraWallet(),
          new PontemWallet(),
          new MartianWallet(),
          new MSafeWalletAdapter(),
        ]}
        autoConnect={true}
      >
        <Component {...pageProps} />
        <Analytics />
      </AptosWalletAdapterProvider>
    </ChakraProvider>
  );
}
