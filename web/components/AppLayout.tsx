import Header from "./Header";
import { Box, Flex } from "@chakra-ui/react";
import Head from "next/head";
import { useContext, useEffect, useState } from "react";
import Web3 from "web3";
import { WalletContext } from "../utils/walletContext";
import Footer from "./Footer";
import { Web3Context } from "../utils/web3Context";

export default function AppLayout ({ children, pageTitle }) {

    // https://mainnet.infura.io/v3/e14446aa2db54feb9068af263aabf2ea
    // for development: use ganache personal blockchain (http://127.0.0.1:7545)
    let web3 =  new Web3("https://mainnet.infura.io/v3/e14446aa2db54feb9068af263aabf2ea");
    let windowType: any;

    const [isLoggedIn, setIsLoggedIn] = useState(undefined);
    const [accountAddress, setAccountAddress] = useState("");
    const [accountBalance, setAccountBalance] = useState();

    // contexts
    const [web3Context, setWeb3Context]: any = useContext(Web3Context);
    const [walletState, setWalletState]: any = useContext(WalletContext);

    useEffect(() => {

        setWeb3Context(web3);

        windowType = window;

        if (typeof windowType.ethereum !== "undefined") {
            loadAccounts();
        } else {
            console.log("consider using MM")
        }

    }, [])

    async function loadAccounts() {
        let accounts = await windowType.ethereum.request({method: "eth_requestAccounts"});
        setAccountAddress(accounts[0]);
        let bal = await web3.eth.getBalance(accounts[0]);
        let ethBal: any = await web3.utils.fromWei(bal, "ether");
        setAccountBalance(ethBal);
        setWalletState({
            address: accounts[0],
            balance: ethBal
        });
    }

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
            </Head>
            <Box
                minHeight="100vh"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                bg="#111111"
            >
                <Header accountAddress={accountAddress} accountBalance={accountBalance} />
                <Box marginTop="200px">
                    {children}
                </Box>
                <Footer />
            </Box>
        </>
    )
}