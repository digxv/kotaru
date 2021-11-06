import Head from "next/head";
import AppLayout from "../../components/AppLayout";
import { Input, Box, Textarea, Text, Spacer, NumberInput, NumberInputField, InputGroup, InputRightAddon, Button, Link } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { WalletContext } from "../../utils/walletContext";
import { useRouter } from 'next/router';
import { ContractContext, Web3Context } from "../../utils/web3Context";
import { db } from "../../utils/firebase";
import axios from "axios";
import Web3 from "web3";

export default function Create() {

    // url params
    const router = useRouter();
    const { id } = router.query;

    // wallet context
    const [walletState, setWalletState]: any = useContext(WalletContext);
    // web3 context
    const [web3Context, setWeb3Context]: any = useContext(Web3Context);
    const [contract, setContract]: any = useContext(ContractContext);
    // window type
    let windowType: any;
    // product details
    const [metaData, setMetaData] = useState({
        filename: "",
        description: "",
        value: 0,
        payable_address: "",
        encrypted_file_cid: "",
        decryption_key: ""
    })
    const [loaded, setLoaded] = useState(false);
    const [value, setValue] = useState(0);
    const [buttonLoading, setButtonLoading] = useState(false);

    useEffect(() => {

        windowType = window;
        LoadObjekt();
        
    }, [id, contract]);

    const LoadObjekt = async () => {
        if (id !== undefined && contract !== undefined) {
            const objektBlock = await contract.methods.objekts(id).call();
            const Http = new XMLHttpRequest();
            const url=`https://ipfs.io/ipfs/${objektBlock.ipfs_uri.substr(7)}`;
            Http.open("GET", url);
            Http.send();
            Http.onloadend = async (e) => {
                let JSON_meta = JSON.parse(Http.responseText);
                setMetaData(JSON_meta);
                setLoaded(true)

                let value_in_eth = await web3Context.utils.fromWei(JSON_meta.value, "ether");
                console.log(value_in_eth);
                setValue(value_in_eth);
            }
        }
    }

    const PayDownloadClick = async () => {

        setButtonLoading(true);

        db.collection("transactions")
        .doc(walletState.address + id)
        .get()
        .then(async txDoc => {
            if(txDoc.exists) {
                let doc_data: any = txDoc.data();
                VerifyUser(doc_data.tx_hash);
            } else {
                if (web3Context !== undefined) {

                    windowType = window;

                    // use metamask to send a transaction
                    let transactionParameters = {
                        nonce: '0x00', // ignored by MetaMask
                        to: metaData.payable_address, // Required except during contract publications.
                        from: walletState.address, // must match user's active address.
                        value: metaData.value, // Only required to send ether to the recipient from the initiating external account.
                        chainId: '0x3', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
                    };

                    // initiate transaction
                    let txHash = await windowType.ethereum.request({
                        method: 'eth_sendTransaction',
                        params: [transactionParameters],
                    });

                    // get transaction using the hash
                    web3Context.eth.getTransaction(txHash).then(async (details) => {
                        let res = await db.collection("transactions").doc(walletState.address + id).set({
                            metadata_cid: id,
                            tx_hash: txHash,
                            from: details.from,
                            to: details.to,
                            value: details.value
                        });
                        VerifyUser(txHash);
                    }).catch(err => {
                        console.log("failed to check transaction");
                        setButtonLoading(false);
                    });
                }
            }
        });
    }
    
    const VerifyUser = (txHash: any) => {
        // messy code but just want to sign the message for now
        // will make it more stable & understandable afterwards
        windowType = window;

        let web3 = new Web3(windowType.ethereum);

        axios.post("/api/generateRandomString", {
            user: walletState.address,
            tx_hash: txHash,
            metadata_cid: id
        }).then(async data => {
            // get the string signed
            let signature = await web3.eth.personal.sign(data.data.string, walletState.address, "");
            // send string to server to verify and get decryption key
            axios.post("/api/getDecryptionKey", {
                string: data.data.string,
                signature: signature
            }).then(resource => {
                DecryptDownload(resource.data.decrypted);
            }).catch(error => {
                console.error(error);
                setButtonLoading(false);
            });
        }).catch(error => {
            console.error(error);
            setButtonLoading(false);
        })
    }

    const DecryptDownload = (key: any) => {
        let Http = new XMLHttpRequest();
        let url=`https://ipfs.io/ipfs/${metaData.encrypted_file_cid}`;
        Http.open("GET", url);
        Http.send();

        Http.onloadend = (e) => {
            let decrypted = CryptoJS.AES.decrypt(Http.responseText, key).toString(CryptoJS.enc.Latin1);
            let link = document.createElement("a");
            link.href = `${decrypted}`;
            link.download = "kotaru.png";
            setButtonLoading(false);
            link.click();
        }
    }

    return (
        <AppLayout pageTitle="Kotaru">
            <Box
                marginRight="auto"
                marginLeft="auto"
                maxWidth="800px"
                paddingRight={[2, 5, 8]}
                paddingLeft={[2, 5, 8]}
                color="white"
            >
                {loaded
                ?
                <>
                    <Text display="inline" fontSize="xl" style={{fontWeight: "bold"}}>
                        {metaData.filename}
                    </Text>
                    <Text display="inline" fontSize="lg">
                        {" "} - {metaData.description}
                    </Text>
                    <Text  paddingTop="5" fontSize="lg">
                        By <span style={{backgroundColor: "yellow", color:"#000"}}>{metaData.payable_address}</span>
                    </Text>
                    <Button
                        paddingTop="25px"
                        paddingBottom="25px"
                        marginTop="5"
                        width="100%"
                        backgroundColor="#000000"
                        color="#ffffff"
                        _hover={{ bg: "#000000" }}
                        _active={{ bg: "#000000" }}
                        _focus={{ bg: "#000000" }}
                        onClick={() => buttonLoading ? null : PayDownloadClick()}
                    >
                        {buttonLoading ? "Loading...": `Pay ${value} ETH & Download`}
                    </Button>
                </>
                :
                <Text fontSize="xl">Loading...</Text>
                }
            </Box>
        </AppLayout>
    )
}
