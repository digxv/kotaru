import Header from "./Header";
import { Box, Flex } from "@chakra-ui/react";
import Head from "next/head";
import { useContext, useEffect, useState } from "react";
import Web3 from "web3";
import { WalletContext } from "../utils/walletContext";
import Footer from "./Footer";
import { ContractContext, Web3Context } from "../utils/web3Context";
import ContractJSON from "../../artifacts/contracts/Kotaru.sol/Kotaru.json";

export default function AppLayout ({ children, pageTitle }) {

    // https://mainnet.infura.io/v3/e14446aa2db54feb9068af263aabf2ea
    // for development: use ganache personal blockchain (http://127.0.0.1:7545)
    // let web3 =  new Web3("https://rinkeby.infura.io/v3/e14446aa2db54feb9068af263aabf2ea");
    let windowType: any;
    let web3: any;
    let provider: any;

    const [isLoggedIn, setIsLoggedIn] = useState(undefined);
    const [accountAddress, setAccountAddress] = useState("");
    const [accountBalance, setAccountBalance] = useState();

    // contexts
    const [web3Context, setWeb3Context]: any = useContext(Web3Context);
    const [walletState, setWalletState]: any = useContext(WalletContext);
    const [contract, setContract]: any = useContext(ContractContext);

    useEffect(() => {
        windowType = window;
        provider = windowType.ethereum;

        if (typeof windowType.ethereum !== "undefined") {
            loadAccounts();
            // initContract();
        } else {
            console.log("consider using MM")
        }
    }, [])

    async function loadAccounts() {
        let accounts = await provider.request({method: "eth_requestAccounts"});
        web3 = new Web3(provider);
        setAccountAddress(accounts[0]);
        let bal = await web3.eth.getBalance(accounts[0]);
        let ethBal: any = await web3.utils.fromWei(bal, "ether");
        setAccountBalance(ethBal);
        setWalletState({
            address: accounts[0],
            balance: ethBal
        });
        initContract()
    }

    async function initContract() {
        let networkId = await web3.eth.net.getId();
        let _contractjson: any = ContractJSON
        let _contract = new web3.eth.Contract(_contractjson.abi, "0x016693c0af859B175BA212e83fAa153e37115D18");
        setContract(_contract);
        console.log(_contract);
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