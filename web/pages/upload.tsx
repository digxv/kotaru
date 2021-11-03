import Head from "next/head";
import AppLayout from "../components/AppLayout";
import { Input, Box, Textarea, Text, Spacer, NumberInput, NumberInputField, InputGroup, InputRightAddon, Button, Link } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { WalletContext } from "../utils/walletContext";
import ipfs from "../utils/ipfs";
import { urlSource } from "ipfs-http-client";
import { ContractContext, Web3Context } from "../utils/web3Context";
import axios from "axios";
import Tx from "ethereumjs-tx";

export default function Upload() {

    // web3 context
    const [web3Context, setWeb3Context]: any = useContext(Web3Context);
    const [contract, setContract]: any = useContext(ContractContext);
    // wallet context
    const [walletState, setWalletState]: any = useContext(WalletContext);
    // form state
    const [filename, setFilename] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice]: any = useState(0);
    const [file, setFile]: any = useState();
    const [formError, setFormError] = useState(false);
    // other state to make everything easy going
    const [uploading, setUploading] = useState(false);
    const [ready, setReady] = useState({
        success: false,
        id: ""
    });

    // all logic to encrypt & upload stuff
    const EncryptUploadClick = () => {
        setUploading(true)
        if (filename.trim().length !== 0 && description.trim().length !== 0 && price.toString().length !== 0 && file !== undefined) {
            setFormError(false);
            let reader = new FileReader();
            reader.onload = (e) => {
                processFile(e);
            }
            reader.readAsDataURL(file);
        } else {
            setFormError(true);
        }
    }

    const processFile = async (e: any) => {
        let passphrase = Math.random().toString(36);
        let encrypted = CryptoJS.AES.encrypt(e.target.result, passphrase);
        let link = document.createElement("a");
        link.href = `data:application/octet-stream,${encrypted}`;
        link.download = "kotaru.encrypted";
        document.body.appendChild(link);
        const { cid } = await ipfs.add(urlSource(`data:application/octet-stream,${encrypted}`));
        // logs
        console.log("encrypted stuff is on ipfs now!");
        // get the passphrase encrypted
        axios.post("/api/encryptString", {
            string: passphrase
        }).then(async (res: any) => {

            let value = await web3Context.utils.toWei(price, "ether");

            console.log(value);

            let JSON_meta = {
                decryption_key: res.data.encryptedString,
                encrypted_file_cid: cid.string,
                payable_address: walletState.address,
                value: value,
                filename: filename,
                description: description
            }

            finalMetaUpload(JSON_meta);

        }).catch(err => {
            console.error(err);
        });
    }

    const finalMetaUpload = async (meta: any) => {
        let MetaString = JSON.stringify(meta);
        const { cid } = await ipfs.add(MetaString);
        setUploading(false);

        axios.post("/api/pinFile", {
            hash: cid.string
        }).then(result => {
            setReady({
                success: true,
                id: cid.string
            });            
        }).catch(error => {
            console.error(error);
        });

    }

    const publishObject = async () => {
        const data = contract.methods.publishObject("hello #1", "ipfs://", 0).send({from: walletState.address});
    }

    return (
        <AppLayout pageTitle="Sell — Kotaru">
            <Box
                marginRight="auto"
                marginLeft="auto"
                maxWidth="800px"
                paddingRight={[2, 5, 8]}
                paddingLeft={[2, 5, 8]}
            >
                {
                    ready.success
                    ?
                    <>
                        <Text fontSize="xl">Your product is ready to be shared with the world! Just copy the link below and send over to your audience.</Text>
                        <br />
                        <Link href={`/f/${ready.id}`} target="_blank" ><Text color="white" letterSpacing="wider" fontWeight="bold" borderRadius="sm" padding="2" bg="blue.400" fontSize="xl">https://v1.kotaru.io/f/{ready.id}</Text></Link>
                    </>
                    :
                    <>
                        {formError ? <Box color="#ffffff" p="3" borderRadius="5" marginBottom="8" bg="red">Fill in all the information!</Box> : null}
                        <Input
                            bg="#E8E8E8"
                            placeholder="Filename"
                            variant="filled"
                            paddingTop="25px"
                            paddingBottom="25px"
                            _hover={{ bg: "#E8E8E8" }}
                            _focus={{ bg: "#E8E8E8" }}
                            _placeholder={{ color: "#707070" }}
                            onChange={(e) => setFilename(e.target.value)}
                        />
                        <Textarea
                            bg="#E8E8E8"
                            placeholder="Description"
                            variant="filled"
                            marginTop="5"
                            _hover={{ bg: "#E8E8E8" }}
                            _focus={{ bg: "#E8E8E8" }}
                            _placeholder={{ color: "#707070" }}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <InputGroup
                            marginTop="5"
                        >
                            <Input
                                bg="#E8E8E8"
                                type="number"
                                placeholder="Price"
                                variant="filled"
                                _hover={{ bg: "#E8E8E8" }}
                                _focus={{ bg: "#E8E8E8" }}
                                _placeholder={{ color: "#707070" }}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                            <InputRightAddon
                                background="#000000"
                                color="#ffffff"
                                children="ETH"
                            />
                        </InputGroup>
                        <Input
                            marginTop="5"
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
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
                            onClick={() => {uploading ? null : EncryptUploadClick()}}
                        >
                            {uploading ? "Loading..." : "Encrypt & Upload"}
                        </Button>
                    </>
                }

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
                    onClick={() => {
                        publishObject()
                    }}
                >
                    Contract Call
                </Button>
            </Box>
        </AppLayout>
    )
}
