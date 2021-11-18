import Head from "next/head";
import AppLayout from "../components/AppLayout";
import { Input, Box, Textarea, Text, Spacer, NumberInput, NumberInputField, InputGroup, InputRightAddon, Button, Link, Tabs, TabList, Tab, TabPanel, TabPanels, Grid } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { WalletContext } from "../utils/walletContext";
import ipfs from "../utils/ipfs";
import { urlSource } from "ipfs-http-client";
import { ContractContext, Web3Context } from "../utils/web3Context";
import axios from "axios";
// import { useEthers } from "@usedapp/core";
import { thirdWeb } from "../utils/thirdWeb";

export default function Sell() {

    const [web3Context, setWeb3Context]: any = useContext(Web3Context);
    const [contract, setContract]: any = useContext(ContractContext);
    const [walletState, setWalletState]: any = useContext(WalletContext);

    const [filename, setFilename] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice]: any = useState(0);
    const [royalty, setRoyalty]: any = useState(0);
    const [file, setFile]: any = useState();
    const [link, setLink]: any = useState("");
    const [formError, setFormError] = useState(false);
 
    const [decryptionKey, setDecryptionKey] = useState("");
    const [uploading, setUploading] = useState({
        isLoading: false,
        text: "Loading..."
    });
    const [ready, setReady] = useState({
        success: false,
        id: ""
    });

    // const { library } = useEthers();
 
    const EncryptUploadClick = () => {
        setUploading({
            isLoading: true,
            text: "Encrypting..." 
        });

        if (filename.trim().length !== 0 && description.trim().length !== 0 && price.toString().length !== 0) {
            if (file !== undefined) {
                setFormError(false);
                let reader = new FileReader();
                reader.onload = (e) => {
                    processFile(e);
                }
                reader.readAsDataURL(file);
            } else if (link.trim().length !== 0) {
                if (link.startsWith("http")) {
                    setFormError(false);
                    processLink();
                } else {
                    setFormError(true);
                    setUploading({
                        isLoading: false,
                        text: ""
                    });
                }
            } else {
                setFormError(true);
                setUploading({
                    isLoading: false,
                    text: "Loading..."
                });
            }
        } else {
            setFormError(true);
            setUploading({
                isLoading: false,
                text: "Loading..."
            });
        }
    }

    const processFile = async (e: any) => {
        try {
            let passphrase = Math.random().toString(36);

            setDecryptionKey(passphrase);

            let encrypted = CryptoJS.AES.encrypt(e.target.result, passphrase);
            let linkEncryptedFile = document.createElement("a");
            linkEncryptedFile.href = `data:application/octet-stream,${encrypted}`;
            linkEncryptedFile.download = "kotaru.encrypted";
            document.body.appendChild(linkEncryptedFile);

            setUploading({
                isLoading: true,
                text: "Uploading..." 
            });

            const { cid } = await ipfs.add(urlSource(`data:application/octet-stream,${encrypted}`));

            let pfObjekt = await axios.post("/api/pinFile", {
                hash: cid.string
            });

            // let encryptStringRes = await axios.post("/api/encryptString", {
            //     string: passphrase
            // });

            let value = await web3Context.utils.toWei(price, "ether");

            let JSON_meta = {
                // decryption_key: encryptStringRes.data.encryptedString,
                encrypted_file_cid: cid.string,
                payable_address: walletState.address,
                value: value,
                filename: filename,
                description: description,
                file_extension: file.name.split('.').pop()
            }

            finalMetaUpload(JSON_meta, passphrase);
            
        } catch (error) {
            console.error(error);
            setUploading({
                isLoading: false,
                text: ""
            });
        }
    }

    const processLink = async () => {
        try {
            let passphrase = Math.random().toString(36);

            let encrypted = CryptoJS.AES.encrypt(link, passphrase);

            // let encryptStringRes = await axios.post("/api/encryptString", {
            //     string: passphrase
            // });

            let value = await web3Context.utils.toWei(price, "ether");

            let JSON_meta = {
                // decryption_key: encryptStringRes.data.encryptedString,
                _link: `${encrypted}`,
                payable_address: walletState.address,
                value: value,
                filename: filename,
                description: description
            }

            finalMetaUpload(JSON_meta, passphrase);
        } catch (error) {
            console.error(error);
            setUploading({
                isLoading: false,
                text: ""
            });
        }
    }

    const finalMetaUpload = async (meta: any, decryption_key: string) => {
        try {
            setUploading({
                isLoading: true,
                text: "Uploading..."
            })

            let MetaString = JSON.stringify(meta);
            const { cid } = await ipfs.add(MetaString);

            await axios.post("/api/pinFile", {
                hash: cid.string
            });

            setUploading({
                isLoading: true,
                text: "Deployment..."
            });

            await axios.post(`/api/grantRole`, {
                address: walletState.address,
                role: "admin",
                contract_address: `0x2998e811b64c365646818f1e7F8D8333f79f2C1b`
            });

            setUploading({
                isLoading: true,
                text: "Transaction 1..."
            });

            let appMod = await thirdWeb.getAppModule("0x2998e811b64c365646818f1e7F8D8333f79f2C1b");

            let deploy = await appMod.deployDropModule({
                name: filename,
                description: description,
                symbol: "XYZ",
                feeRecipient: walletState.address,
                sellerFeeBasisPoints: royalty * 100,
                maxSupply: 1000000,
            });

            setUploading({
                isLoading: true,
                text: "Transaction 2..."
            });

            let dropModule = await thirdWeb.getDropModule(deploy.address);

            await dropModule.setPublicMintConditions([{
                maxMintSupply: 1000000,
                pricePerToken: meta.value
            }]);

            let addReqResponse = await axios.post("/api/add", {
                name: filename,
                ipfs_uri: cid.string,
                decryption_key: decryption_key,
                contract_address: deploy.address
            });

            setReady({
                success: true,
                id: addReqResponse.data.slug
            });

            setUploading({
                isLoading: false,
                text: ""
            });

        } catch (error) {
            console.error(error);
            setUploading({
                isLoading: false,
                text: ""
            });
        }
    }

    // const randomClick = async () => {
    //     // let appMod = await thirdWeb.getAppModule("0x2998e811b64c365646818f1e7F8D8333f79f2C1b");

    //     // let deploy = await appMod.deployDropModule({
    //     //     name: "filename",
    //     //     description: "description",
    //     //     symbol: "XYZ",
    //     //     feeRecipient: walletState.address,
    //     //     sellerFeeBasisPoints: 1 * 100,
    //     //     maxSupply: 1000000,
    //     // });

    //     // console.log(deploy.address);

    //     let dropModule = await thirdWeb.getDropModule(`0x8f8e7723929340fD03285De70379c00791a4D28A`);

    //     let value = await web3Context.utils.toWei(`0.011`, "ether");

    //     let setMintAmount = await dropModule.setPublicMintConditions([{
    //         maxMintSupply: 1000,
    //         pricePerToken: value
    //     }]);

    //     console.log(setMintAmount);
    // }

    // const buyNFT = async () => {
    //     let dropModule = await thirdWeb.getDropModule("0x8f8e7723929340fD03285De70379c00791a4D28A");

    //     // let mint = await dropModule.lazyMint({
    //     //     name: "WAGMI",
    //     //     description: "bro, WAGMI!"
    //     // })

    //     // console.log(mint);
        
    //     let buy = await dropModule.claim(1);

    //     console.log(buy);
    // }

    return (
        <AppLayout pageTitle="Sell w/ NFTs — Kotaru.xyz">
            <Box
                paddingRight={[2, 5, 8]}
                paddingLeft={[2, 5, 8]}
            >
                <Box bgColor="green.300" maxWidth="800px" borderRadius="md" p="4" mb="5">
                    Sellers can enable buyers to hold their tokens to access the product, helping with royalties on resell & many more use-cases.
                </Box>
                {
                    ready.success
                    ?
                    <Box marginLeft="auto" marginRight="auto" maxWidth="800px">
                        <Text color="white" fontSize="xl">Your product is ready to be shared with the world! Just copy the link below and send over to your audience.</Text>
                        <br />
                        <Link href={`/objekt/${ready.id}`} target="_blank" ><Text color="white" letterSpacing="wider" fontWeight="bold" borderRadius="sm" padding="2" bg="blue.400" fontSize="xl">https://kotaru.xyz/objekt/{ready.id}</Text></Link>
                    </Box>
                    :
                    <Box borderRadius="xl">
                        {formError ? <Box color="#ffffff" p="3" borderRadius="5" marginBottom="8" bg="red">Fill in all the information!</Box> : null}
                        <Box borderTopRadius="xl" borderRadius="xl" bg="#E8E8E8">
                            <Input
                                bg="#E8E8E8"
                                placeholder="Name"
                                borderRadius="xl"
                                variant="filled"
                                paddingTop="25px"
                                paddingBottom="25px"
                                _hover={{ bg: "#E8E8E8" }}
                                _focus={{ bg: "#E8E8E8" }}
                                _placeholder={{ color: "#707070" }}
                                onChange={(e) => setFilename(e.target.value)}
                            />

                            <Box border="1px #bbb solid" />

                            <Textarea
                                bg="#E8E8E8"
                                placeholder="Description"
                                variant="filled"
                                paddingTop="25px"
                                _hover={{ bg: "#E8E8E8" }}
                                _focus={{ bg: "#E8E8E8" }}
                                _placeholder={{ color: "#707070" }}
                                onChange={(e) => setDescription(e.target.value)}
                            />

                            {/* <Box border="2px #bbb solid" /> */}
                            
                        </Box>

                        <Box mt="5" borderRadius="xl" bg="#E8E8E8">
                            <Tabs marginTop="5" isFitted>
                                <TabList>
                                    <Tab>Link</Tab>
                                    <Tab>Upload</Tab>
                                </TabList>

                                <TabPanels padding="0">
                                    <TabPanel padding="0">
                                        <Input
                                            bg="#E8E8E8"
                                            placeholder="Paste an URL"
                                            variant="filled"
                                            _hover={{ bg: "#E8E8E8" }}
                                            _focus={{ bg: "#E8E8E8" }}
                                            _placeholder={{ color: "#707070" }}
                                            onChange={(e) => setLink(e.target.value)}
                                            paddingBottom="25px"
                                            paddingTop="25px"
                                            borderRadius="xl"
                                        />
                                    </TabPanel>
                                    <TabPanel padding="0">
                                        <Input
                                            marginTop="5"
                                            type="file"
                                            onChange={(e) => setFile(e.target.files[0])}
                                            borderRadius="xl"
                                        />
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </Box>
                        
                        <Box border="0" mt="5" borderRadius="xl" bg="#E8E8E8">

                            <Grid width="100%" templateColumns="repeat(2, 1fr)">
                                <InputGroup
                                    borderTopRadius="xl"
                                >
                                    <Input
                                        bg="#E8E8E8"
                                        type="number"
                                        placeholder="Fixed Price"
                                        variant="filled"
                                        _hover={{ bg: "#E8E8E8" }}
                                        _focus={{ bg: "#E8E8E8" }}
                                        _placeholder={{ color: "#707070" }}
                                        onChange={(e) => setPrice(e.target.value)}
                                        paddingBottom="25px"
                                        paddingTop="25px"
                                        border="0"
                                    />
                                    <InputRightAddon
                                        background="gray.900"
                                        color="#ffffff"
                                        children="ETH"
                                        paddingBottom="25px"
                                        paddingTop="25px"
                                        border="0"
                                        borderRightRadius="0"
                                    />
                                </InputGroup>

                                <InputGroup
                                    borderTopRadius="xl"
                                >
                                    <Input
                                        bg="#E8E8E8"
                                        type="number"
                                        placeholder="Royalty"
                                        variant="filled"
                                        _hover={{ bg: "#E8E8E8" }}
                                        _focus={{ bg: "#E8E8E8" }}
                                        _placeholder={{ color: "#707070" }}
                                        onChange={(e) => setRoyalty(e.target.value)}
                                        paddingBottom="25px"
                                        paddingTop="25px"
                                        border="0"
                                    />
                                    <InputRightAddon
                                        background="gray.900"
                                        color="#ffffff"
                                        children="%"
                                        paddingBottom="25px"
                                        paddingTop="25px"
                                        border="0"
                                        borderBottomRightRadius="0"
                                    />
                                </InputGroup>
                            </Grid>

                            <Button
                                borderTopRadius="0"
                                borderBottomRadius="xl"
                                paddingTop="25px"
                                paddingBottom="25px"
                                // marginTop="5"
                                width="100%"
                                cursor={uploading.isLoading ? "wait" : "pointer"}
                                bgGradient="linear(to-l, #09c6f9, #045de9)"
                                color="#ffffff"
                                _hover={{bgGradient: "linear(to-l, #09c6f9, #045de9)"}}
                                _active={{bgGradient: "linear(to-l, #09c6f9, #045de9)"}}
                                _focus={{bgGradient: "linear(to-l, #09c6f9, #045de9)"}}
                                onClick={() => {uploading.isLoading ? null : EncryptUploadClick()}}
                                textTransform="uppercase"
                                letterSpacing="1.2px"
                                fontSize="lg"
                            >
                                {uploading.isLoading ? uploading.text : "Mint"}
                            </Button>

                            {/* <Button onClick={() => randomClick()}>Click Me</Button>
                            <Button onClick={() => buyNFT()}>Buy</Button> */}
                        </Box>
                    </Box>
                }
            </Box>
        </AppLayout>
    )
}
