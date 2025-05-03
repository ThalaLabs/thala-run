import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = extendTheme({ config });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <AptosWalletAdapterProvider
        autoConnect={true}
        onError={console.error}
      >
        <Component {...pageProps} />
        <Analytics />
      </AptosWalletAdapterProvider>
    </ChakraProvider>
  );
}
