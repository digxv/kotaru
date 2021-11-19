import Head from "next/head";
import AppLayout from "../../components/AppLayout";
import { Input, Box, Textarea, Text, Spacer, NumberInput, NumberInputField, InputGroup, InputRightAddon, Button, Link, Spinner } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { WalletContext } from "../../utils/walletContext";
import { useRouter } from 'next/router';
import { ContractContext, Web3Context } from "../../utils/web3Context";
import axios from "axios";
import Web3 from "web3";
import { FaDownload } from "react-icons/fa";
// import util from "ethereumjs-util";
import secp256k1, { publicKeyCreate } from "secp256k1";

export default function BuyObjekt() {

    const router = useRouter();
    const { id } = router.query;

    const [walletState, setWalletState]: any = useContext(WalletContext);
    const [web3Context, setWeb3Context]: any = useContext(Web3Context);
    const [contract, setContract]: any = useContext(ContractContext);

    const [metaData, setMetaData]: any = useState({
        filename: "",
        description: "",
        value: 0,
        payable_address: "",
        encrypted_file_cid: "",
        decryption_key: ""
    })
    const [loaded, setLoaded] = useState(false);
    const [value, setValue] = useState(0);
    const [downloads, setDownloads] = useState(0);
    const [buttonLoading, setButtonLoading] = useState(false);

    useEffect(() => {
        LoadObjekt();
    }, [id, contract]);

    const LoadObjekt = async () => {
        if (id !== undefined && contract !== undefined) {
            const objektBlock = await contract.methods.objekts(id).call();
            setDownloads(objektBlock.downloads);
            const Http = new XMLHttpRequest();
            const url=`https://ipfs.io/ipfs/${objektBlock.ipfs_uri.substr(7)}`;
            Http.open("GET", url);
            Http.send();
            Http.onloadend = async (e) => {
                let JSON_meta = JSON.parse(Http.responseText);
                console.log(JSON_meta);
                setMetaData(JSON_meta);
                setLoaded(true)
                let value_in_eth = await web3Context.utils.fromWei(JSON_meta.value, "ether");
                setValue(value_in_eth);
            }
        }
    }

    const PayDownloadClick = async () => {
        setButtonLoading(true);

        let downloads = [];
        let totalDownloads = await contract.methods.totalDownloads().call();

        for(let i = 1; i < totalDownloads; i++) {
            let download = await contract.methods.downloads(i).call();
            downloads.push(download);
        }

        let filterDownloads = downloads.filter(download => download.objekt_id === id && download.buyer.toLowerCase() === walletState.address.toLowerCase());

        if(filterDownloads.length > 0) {
            VerifyUser(filterDownloads[0].id);
        } else {
            buyObjektCall().then(res => {
                VerifyUser(res.events.ObjektBought.returnValues.id);
            });
        }
    }
    
    const VerifyUser = async (download_id: any) => {
        let windowType: any = window;
        let provider: any = windowType.ethereum;

        try {
            let randomStringRes = await axios.post("/api/generateRandomString", {
                download_id: download_id
            });

            let signature = await web3Context.eth.personal.sign(randomStringRes.data.string, walletState.address, "");
    
            let decryptContentRes = await axios.post("/api/decryptContent", {
                string: randomStringRes.data.string,
                signature: signature,
            });

            if (metaData._link !== undefined) {
                window.open(decryptContentRes.data.decryptedLink, '_blank');
                setButtonLoading(false);
            } else {
                let link = document.createElement("a");
                link.href = decryptContentRes.data.decryptedFile;
                if(metaData.file_extension.length === 0) {
                    link.download = `${metaData.filename}.pdf`;
                } else {
                    link.download = `${metaData.filename}.${metaData.file_extension}`;
                }
                setButtonLoading(false);
                link.click();
            }
        } catch (error) {
            console.error(error);
            setButtonLoading(false);
        }
    }

    const buyObjektCall = async () => {
        return await contract.methods.buyObjekt(id).send({
            from: walletState.address,
            value: metaData.value
        })
    }

    return (
        <AppLayout pageTitle="Kotaru.xyz">
            {/* <Box
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
                    <Box bgColor="green.300" color="black" maxWidth="800px" borderRadius="md" p="4" mb="5">
                        Kotaru.xyz is experimental & a new smart contract will be deployed soon. File below is meant to demonstrate how the platform works.
                    </Box>
                    <Text display="inline" fontSize="4xl" style={{fontWeight: "bold"}}>
                        {metaData.filename}
                    </Text>
                    <Text color={"gray.500"} fontSize="lg">
                        <Text display="inline" marginRight="2"><FaDownload style={{
                            display: "inline"
                        }} /> {downloads} </Text>
                        {metaData.description}
                    </Text>
                    <Text  paddingTop="5" fontSize="lg">
                        By <span style={{backgroundColor: "yellow", color:"#000"}}>{metaData.payable_address}</span>
                    </Text>
                    <Button
                        paddingTop="25px"
                        paddingBottom="25px"
                        marginTop="5"
                        width="100%"
                        backgroundColor="gray.900"
                        color="#ffffff"
                        _hover={{ bg: "gray.900" }}
                        _active={{ bg: "gray.900" }}
                        _focus={{ bg: "gray.900" }}
                        onClick={() => buttonLoading ? null : PayDownloadClick()}
                    >
                        {buttonLoading ? "Loading...": `Pay ${value} ETH & Download`}
                    </Button>
                </>
                :
                <Spinner size="lg" />
                }
            </Box> */}
        </AppLayout>
    )
}
