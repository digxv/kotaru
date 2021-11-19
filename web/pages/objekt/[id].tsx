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
import { thirdWeb } from "../../utils/thirdWeb";

export default function Objekt() {

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
        decryption_key: "",
        ipfs_uri: ""
    });
    const [loaded, setLoaded] = useState(false);
    const [value, setValue] = useState(0);
    const [downloads, setDownloads] = useState(0);
    const [buttonLoading, setButtonLoading] = useState({
        loading: false,
        text: ""
    });

    const [objektContractAddress, setObjektContractAddress] = useState("");
    const [objektContract, setObjektContract] = useState(null);
    const [alreadyMinted, setAlreadyMinted] = useState(false);

    useEffect(() => {
        LoadObjekt();
    }, [id, contract]);

    const LoadObjekt = async () => {
        if (id !== undefined && contract !== undefined) {
            const objekt = await axios.get(`/api/objekt/${id}`);
            const objektData = objekt.data;

            const _objektContract = await thirdWeb.getDropModule(objektData.contract_address);

            const objektContractConditions = await _objektContract.contract.mintConditions(0);
            const objektContractConditionsPPT = await objektContractConditions["pricePerToken"];
            const NFTsMinted = await _objektContract.getAll();
            console.log(walletState.address);
            const NFTsMintedByUser = await _objektContract.balanceOf(walletState.address);
            NFTsMintedByUser.toString() === "0" ? setAlreadyMinted(false) : setAlreadyMinted(true); 

            setObjektContract(_objektContract);
            setValue(await web3Context.utils.fromWei(`${objektContractConditionsPPT.toNumber()}`, "ether"));
            setObjektContractAddress(_objektContract.address);
            setMetaData(objektData);
            setDownloads(NFTsMinted.length);
            setLoaded(true);
        }
    }

    const PayDownloadClick = async () => {
        try {
            setButtonLoading({
                loading: true, 
                text: "Preparing NFT..."
            });

            await axios.post(`/api/grantRole`, {
                contract_address: objektContractAddress,
                role: "minter",
                address: walletState.address,
                objekt: true
            });

            setButtonLoading({
                loading: true,
                text: "Lazy Mint..."
            })

            await objektContract.lazyMint({
                name: metaData.filename,
                description: metaData.description,
                objekt_uri: metaData.ipfs_uri
            });

            setButtonLoading({
                loading: true,
                text: "Claim NFT..."
            })

            await objektContract.claim(1);

            VerifyUser();
        } catch {
            setButtonLoading({
                loading: false,
                text: ""
            });
        }
    }
    
    const VerifyUser = async () => {
        let windowType: any = window;
        let provider: any = windowType.ethereum;

        setButtonLoading({
            loading: true,
            text: "Verify Ownership..."
        })

        try {
            let randomStringRes = await axios.get(`/api/randomstring/${walletState.address}`);
            let signature = await web3Context.eth.personal.sign(randomStringRes.data.string, walletState.address, "");

            setButtonLoading({
                loading: true,
                text: "Downloading..."
            })

            let downloadReqRes = await axios.post(`/api/download`, {
                signature: signature,
                objekt_contract: objektContractAddress,
                string: randomStringRes.data.string
            });

            if(metaData._link !== undefined) {
                window.open(downloadReqRes.data.decryptedLink);
                setButtonLoading({
                    loading: false,
                    text: ""
                });
            } else {
                let link = document.createElement("a");
                link.href = downloadReqRes.data.decryptedFile;

                if(metaData.file_extension.length === 0) {
                    link.download = `${metaData.filename}.pdf`;
                } else {
                    link.download = `${metaData.filename}.${metaData.file_extension}`;
                }

                setButtonLoading({
                    loading: false,
                    text: ""
                });

                link.click();
            }
        } catch (error) {
            console.error(error);
            setButtonLoading({
                loading: false,
                text: ""
            })
        }
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
                    <Box bgColor="green.300" color="black" maxWidth="800px" borderRadius="md" p="4" mb="5">
                        Buyers are required to mint and hold the product token to access it. Use the Download button to do so.
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
                        <span style={{backgroundColor: "yellow", color:"#000"}}>{objektContractAddress}</span>
                    </Text>
                    {
                        alreadyMinted
                        ?
                        <Button
                            cursor={buttonLoading.loading ? "wait" : "pointer"}
                            paddingTop="25px"
                            paddingBottom="25px"
                            marginTop="5"
                            width="100%"
                            bgGradient="linear(to-l, #09c6f9, #045de9)"
                            color="#ffffff"
                            _hover={{bgGradient: "linear(to-l, #09c6f9, #045de9)"}}
                            _active={{bgGradient: "linear(to-l, #09c6f9, #045de9)"}}
                            _focus={{bgGradient: "linear(to-l, #09c6f9, #045de9)"}}
                            onClick={() => buttonLoading.loading ? null : VerifyUser()}
                            textTransform="uppercase"
                            letterSpacing="1.2px"
                            fontSize="lg"
                        >
                            {buttonLoading.loading ? buttonLoading.text : `Download`}
                        </Button>
                        :
                        <Button
                            cursor={buttonLoading.loading ? "wait" : "pointer"}
                            paddingTop="25px"
                            paddingBottom="25px"
                            marginTop="5"
                            width="100%"
                            bgGradient="linear(to-l, #09c6f9, #045de9)"
                            color="#ffffff"
                            _hover={{bgGradient: "linear(to-l, #09c6f9, #045de9)"}}
                            _active={{bgGradient: "linear(to-l, #09c6f9, #045de9)"}}
                            _focus={{bgGradient: "linear(to-l, #09c6f9, #045de9)"}}
                            onClick={() => buttonLoading.loading ? null : PayDownloadClick()}
                            textTransform="uppercase"
                            letterSpacing="1.2px"
                            fontSize="lg"
                        >
                            {buttonLoading.loading ? buttonLoading.text : `Pay ${value} ETH & Download`}
                        </Button>
                    }
                </>
                :
                <Spinner size="lg" />
                }
            </Box>
        </AppLayout>
    )
}
