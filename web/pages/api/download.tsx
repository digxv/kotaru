import CryptoJS from "crypto-js";
import Web3 from "web3";
import ContractJSON from "../../../artifacts/contracts/Kotaru.sol/Kotaru.json";
import axios from "axios";
import firebase from 'firebase/app'
import 'firebase/firestore'
import ecies from "eth-ecies";
import EthCrypto from "eth-crypto";

export default async (req, response) => {
    if(req.method === "POST") {
        console.log(req.body.public_key);

        let web3 =  new Web3(process.env.RINKEBY_INFURA_URL)
        let _contractJSON: any = ContractJSON;
        let contract = new web3.eth.Contract(_contractJSON.abi, "0xe1EBD03808a6C080350501140Ac8Cf9740F6Ba47");
        let kotaruWallet = EthCrypto.createIdentity();

        let downloadBlock = await contract.methods.downloads(req.body.download_id).call();
        let objekt = await contract.methods.objekts(downloadBlock.objekt_id).call();

        // console.log("this", EthCrypto.publicKey.toAddress(req.body.publicKey), downloadBlock.buyer);

        // let signingAddress = web3.eth.accounts.recover(req.body.string, req.body.signature);

        let url=`https://ipfs.io/ipfs/${objekt.ipfs_uri.substr(7)}`;
        let objekt_metadata = (await axios.get(url)).data;
        let decrypted = CryptoJS.AES.decrypt(objekt_metadata.decryption_key, process.env.KEY_THAT_DO_WONDERS);
        let decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

        if(objekt_metadata._link !== undefined) {
            let decryptedLink = CryptoJS.AES.decrypt(objekt_metadata._link, decryptedString).toString(CryptoJS.enc.Latin1);

            let signature = EthCrypto.sign(
                kotaruWallet.privateKey,
                EthCrypto.hash.keccak256(decryptedLink)
            );

            let payload = {
                message: decryptedLink,
                signature
            }

            console.log(req.body.public_key.length);

            let ab: any = new ArrayBuffer(req.body.public_key.length);
            let view: any = new Uint8Array(ab);

            for (var i = 0; i < req.body.public_key.length; ++i) {
                view[i] = req.body.length[i];
            }

            console.log(view);

            let encrypted = await EthCrypto.encryptWithPublicKey(
                view,
                JSON.stringify(payload)
            );

            let encryptedString = EthCrypto.cipher.stringify(encrypted);
        
            console.log(encryptedString);

            return response.status(200).json({
                decryptedLink: decryptedLink,
                // encrypted: encrypted
            });
        } else {
            let file_url = `https://ipfs.io/ipfs/${objekt_metadata.encrypted_file_cid}`;
            console.log(file_url);
            let encryptedFile = (await axios.get(file_url)).data;
            let decryptedFile = CryptoJS.AES.decrypt(encryptedFile, decryptedString).toString(CryptoJS.enc.Latin1);

            return response.status(200).json({
                decryptedFile: decryptedFile
            });
        }

        // if(signingAddress === downloadBlock.buyer) {
        //     let url=`https://ipfs.io/ipfs/${objekt.ipfs_uri.substr(7)}`;
        //     let objekt_metadata = (await axios.get(url)).data;
        //     let decrypted = CryptoJS.AES.decrypt(objekt_metadata.decryption_key, process.env.KEY_THAT_DO_WONDERS);
        //     let decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

        //     if(objekt_metadata._link !== undefined) {
        //         let decryptedLink = CryptoJS.AES.decrypt(objekt_metadata._link, decryptedString).toString(CryptoJS.enc.Latin1);
        //         let linkBuffer = new Buffer(decryptedLink);
        //         let encrypted = ecies.encrypt()

        //         return response.status(200).json({
        //             decryptedLink: decryptedLink
        //         });
        //     } else {
        //         let file_url = `https://ipfs.io/ipfs/${objekt_metadata.encrypted_file_cid}`;
        //         console.log(file_url);
        //         let encryptedFile = (await axios.get(file_url)).data;
        //         let decryptedFile = CryptoJS.AES.decrypt(encryptedFile, decryptedString).toString(CryptoJS.enc.Latin1);

        //         return response.status(200).json({
        //             decryptedFile: decryptedFile
        //         });
        //     }
        // }
    } else {
        response.status(400).json({ msg: "wrong method bro" });
    }
};