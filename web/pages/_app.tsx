import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import { WalletProvider } from "../utils/walletContext";
import "@fontsource/inter";
import "@fontsource/open-sans";
import "../styles/globals.css";
import { Web3Provider, ContractProvider } from "../utils/web3Context";

function MyApp({ Component, pageProps }) {
  return (
    <div className="App">
      <ChakraProvider>
      <Web3Provider>
      <ContractProvider>
      <WalletProvider>
        <Component {...pageProps} />
      </WalletProvider>
      </ContractProvider>
      </Web3Provider>
      </ChakraProvider>
    </div>
  );
}

export default MyApp;
