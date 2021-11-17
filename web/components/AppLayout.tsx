import Header from "./Header";
import { Box, Flex } from "@chakra-ui/react";
import Head from "next/head";
import { useContext, useEffect, useState } from "react";
import Web3 from "web3";
import { WalletContext } from "../utils/walletContext";
import Footer from "./Footer";
import { ContractContext, Web3Context } from "../utils/web3Context";
import ContractJSON from "../../artifacts/contracts/Kotaru.sol/Kotaru.json";
import { ethers } from "@usedapp/core/node_modules/ethers";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { initThirdWeb } from "../utils/thirdWeb";

export default function AppLayout ({ children, pageTitle }) {
    let windowType: any;
    let web3: any;

    const [isLoggedIn, setIsLoggedIn] = useState(undefined);
    const [accountAddress, setAccountAddress] = useState("");
    const [accountBalance, setAccountBalance] = useState();

    const [web3Context, setWeb3Context]: any = useContext(Web3Context);
    const [walletState, setWalletState]: any = useContext(WalletContext);
    const [contract, setContract]: any = useContext(ContractContext);

    useEffect(() => {
        windowType = window;

        if (typeof windowType.ethereum !== "undefined") {
            loadAccounts();
        } else {
            console.log("consider using MM")
        }
    }, [])

    async function loadAccounts() {
        const provider = new ethers.providers.Web3Provider(windowType.ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();

        setAccountAddress(address);

        // let sdk = new ThirdwebSDK(signer);
        initThirdWeb(signer);

        const web3Provider = windowType.ethereum;
        web3 = new Web3(web3Provider);
        setWeb3Context(web3);

        let bal = await web3.eth.getBalance(address);
        let ethBal: any = await web3.utils.fromWei(bal, "ether");
        setAccountBalance(ethBal);

        setWalletState({
            address: address,
            // publicKey: publicKey,
            balance: ethBal
        });

        initContract(address)
    }

    async function initContract(wallet_address: string) {
        // let networkId = await web3.eth.net.getId();
        let _contractjson: any = ContractJSON
        let _contract = new web3.eth.Contract(_contractjson.abi, process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
        setContract(_contract);

        let objekts = [];
        let objektCount = await _contract.methods.objektCount().call()

        for(let i = 0; i < objektCount; i++) {
            let objekt = await _contract.methods.objekts(i).call();
            if(objekt.publisher.toLowerCase() === wallet_address.toLowerCase()) {
                objekts.push(objekt)
            }
        }
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
                bg="#000000"
            >
                <Header accountAddress={accountAddress} accountBalance={accountBalance} />
                <Box maxWidth="1200px" marginLeft="auto" marginRight="auto" marginTop="200px">
                    {children}
                </Box>
                <Footer />
            </Box>
        </>
    )
}