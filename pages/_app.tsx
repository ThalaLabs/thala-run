import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { ChakraProvider } from "@chakra-ui/react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { MartianWallet } from "../components/wallets/MartianWallet";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <AptosWalletAdapterProvider
        plugins={[new PetraWallet(), new MartianWallet()]}
        autoConnect={true}
      >
        <Component {...pageProps} />
        <Analytics />
      </AptosWalletAdapterProvider>
    </ChakraProvider>
  );
}
