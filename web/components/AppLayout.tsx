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
    let windowType: any;
    let web3: any;
    let provider: any;

    const [isLoggedIn, setIsLoggedIn] = useState(undefined);
    const [accountAddress, setAccountAddress] = useState("");
    const [accountBalance, setAccountBalance] = useState();

    const [web3Context, setWeb3Context]: any = useContext(Web3Context);
    const [walletState, setWalletState]: any = useContext(WalletContext);
    const [contract, setContract]: any = useContext(ContractContext);

    useEffect(() => {
        windowType = window;
        provider = windowType.ethereum;

        if (typeof windowType.ethereum !== "undefined") {
            loadAccounts();
        } else {
            console.log("consider using MM")
        }
    }, [])

    async function loadAccounts() {
        let accounts = await provider.request({method: "eth_requestAccounts"});
        // let publicKey = await provider.request({
        //     method: "eth_getEncryptionPublicKey",
        //     params: [accounts[0]]
        // });

        setAccountAddress(accounts[0]);

        web3 = new Web3(provider);
        setWeb3Context(web3);

        let bal = await web3.eth.getBalance(accounts[0]);
        let ethBal: any = await web3.utils.fromWei(bal, "ether");
        setAccountBalance(ethBal);
        setWalletState({
            address: accounts[0],
            // publicKey: publicKey,
            balance: ethBal
        });
        initContract(accounts[0])
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