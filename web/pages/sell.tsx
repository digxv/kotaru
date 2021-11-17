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
import { ThirdwebSDK } from "@3rdweb/sdk";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";
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

    const { library } = useEthers();
 
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
            setDecryptionKey(passphrase);

            let pfObjekt = await axios.post("/api/pinFile", {
                hash: cid.string
            });

            let encryptStringRes = await axios.post("/api/encryptString", {
                string: passphrase
            });

            let value = await web3Context.utils.toWei(price, "ether");

            let JSON_meta = {
                decryption_key: encryptStringRes.data.encryptedString,
                encrypted_file_cid: cid.string,
                payable_address: walletState.address,
                value: value,
                filename: filename,
                description: description,
                file_extension: file.name.split('.').pop()
            }

            finalMetaUpload(JSON_meta);
            
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

            let encryptStringRes = await axios.post("/api/encryptString", {
                string: passphrase
            });

            let value = await web3Context.utils.toWei(price, "ether");

            let JSON_meta = {
                decryption_key: encryptStringRes.data.encryptedString,
                _link: `${encrypted}`,
                payable_address: walletState.address,
                value: value,
                filename: filename,
                description: description
            }

            finalMetaUpload(JSON_meta);
        } catch (error) {
            console.error(error);
            setUploading({
                isLoading: false,
                text: ""
            });
        }
    }

    const finalMetaUpload = async (meta: any) => {
        try {
            setUploading({
                isLoading: true,
                text: "Confirming Transaction..."
            })

            let MetaString = JSON.stringify(meta);
            const { cid } = await ipfs.add(MetaString);

            let pfMetadata = await axios.post("/api/pinFile", {
                hash: cid.string
            });

            // publishObjekt(`ipfs://${cid.string}`, filename, meta.value).then(res => {
            //     setReady({
            //         success: true,
            //         id: res.events.ObjektPublished.returnValues.id
            //     }); 

            //     setUploading({
            //         isLoading: false,
            //         text: ""
            //     });
            // }).catch(err => {
            //     console.error(err)
            // })

            // let addReqResponse = await axios.post("/api/add", {
                
            // })

            

        } catch (error) {
            console.error(error);
            setUploading({
                isLoading: false,
                text: ""
            });
        }
    }

    const randomClick = async () => {
        // let deploy = thirdWeb.getAppModule("0xf2D78D0485Cb74f6D9127F8499d0220865911735").deployNftModule({
        //     name: "Random Name",
        //     description: "Random Description",
        //     symbol: "DIG",
        //     feeRecipient: walletState.address,
        //     sellerFeeBasisPoints: 100
        // });

        // console.log((await deploy).getMetadata);

        let NFT = thirdWeb.getNFTModule(`0xf2D78D0485Cb74f6D9127F8499d0220865911735`);

        let token = await NFT.mintTo(walletState.address, {
            name: "smth",
            description: "smth"
        })

        console.log(token);
    }
 
    const publishObjekt = async (ipfs_hash: string, name: string, price: number) => {
        return contract.methods.publishObjekt(name, ipfs_hash, price).send({from: walletState.address});
    }

    return (
        <AppLayout pageTitle="Upload — Kotaru.xyz">
            <Box
                paddingRight={[2, 5, 8]}
                paddingLeft={[2, 5, 8]}
            >
                {
                    ready.success
                    ?
                    <Box maxWidth="800px">
                        <Text color="white" fontSize="xl">Your product is ready to be shared with the world! Just copy the link below and send over to your audience.</Text>
                        <br />
                        <Link href={`/f/${ready.id}`} target="_blank" ><Text color="white" letterSpacing="wider" fontWeight="bold" borderRadius="sm" padding="2" bg="blue.400" fontSize="xl">https://kotaru.xyz/f/{ready.id}</Text></Link>
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

                            <Button onClick={() => randomClick()}>
                                Click
                            </Button>
                        </Box>
                    </Box>
                }
            </Box>
        </AppLayout>
    )
}
