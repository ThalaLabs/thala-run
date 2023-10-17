import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { PontemWallet } from "@pontem/wallet-adapter-plugin";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { MSafeWalletAdapter } from "msafe-plugin-wallet-adapter";

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = extendTheme({ config });

export default function App({ Component, pageProps }: AppProps) {
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
