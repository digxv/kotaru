import Head from "next/head";
import AppLayout from "../../components/AppLayout";
import { Input, Box, Textarea, Text, Spacer, NumberInput, NumberInputField, InputGroup, InputRightAddon, Button, Link } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { WalletContext } from "../../utils/walletContext";
import { useRouter } from 'next/router';
import { ContractContext, Web3Context } from "../../utils/web3Context";
import axios from "axios";
import Web3 from "web3";

export default function Objekt() {

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
            const url=`https://gateway.pinata.cloud/ipfs/${objektBlock.ipfs_uri.substr(7)}`;
            Http.open("GET", url);
            Http.send();
            Http.onloadend = async (e) => {
                let JSON_meta = JSON.parse(Http.responseText);
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
            console.log(filterDownloads[0].id);
            VerifyUser(filterDownloads[0].id);
        } else {
            buyObjektCall().then(res => {
                console.log(res.events.ObjektBought.returnValues.id);
                VerifyUser(res.events.ObjektBought.returnValues.id);
            });
        }
    }
    
    const VerifyUser = async (download_id: any) => {
        try {
            let randomStringRes = await axios.post("/api/generateRandomString", {
                download_id: download_id
            })
    
            let signature = await web3Context.eth.personal.sign(randomStringRes.data.string, walletState.address, "");
    
            let decryptionKeyRes = await axios.post("/api/getDecryptionKey", {
                string: randomStringRes.data.string,
                signature: signature,
            });

            // DecryptDownload(decryptionKeyRes.data.decrypted, decryptionKeyRes.data.encryptedFile);
            console.log(decryptionKeyRes.data.decryptedFile);
            let link = document.createElement("a");
            link.href = decryptionKeyRes.data.decryptedFile;
            link.download = `${metaData.filename}.pdf`;
            setButtonLoading(false);
            link.click();
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
                <Text fontSize="xl">Loading...</Text>
                }
            </Box>
        </AppLayout>
    )
}
