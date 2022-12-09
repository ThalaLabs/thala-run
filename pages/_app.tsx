import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <AptosWalletAdapterProvider
        plugins={[new PetraWallet()]}
        autoConnect={true}
      >
        <Component {...pageProps} />
      </AptosWalletAdapterProvider>
    </ChakraProvider>
  );
}
