import { ThirdwebSDK } from "@3rdweb/sdk";
import axios from "axios";
import { ethers } from "ethers";
import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import Web3 from "web3";
import CryptoJS from "crypto-js";

export default async (req, res) => {
    if(req.method === "POST") {
        const { objekt_contract, signature, string } = req.body;

        let firebaseConfig = {
            apiKey: process.env.FB_API_KEY,
            authDomain: process.env.AUTH_DOMAIN,
            projectId: process.env.PROJECT_ID,
            storageBucket: process.env.STORAGE_BUCKET,
            messagingSenderId: process.env.MESSAGING_SENDER_ID,
            appId: process.env.FB_APP_ID
        };
        
        let firebaseApp = initializeApp(firebaseConfig);
        let db = getFirestore();

        const q_signatures = query(collection(db, "signatures"), where("string", "==", string));

        const querySnapshot = await getDocs(q_signatures);

        let docs = [];

        querySnapshot.forEach(doc => {
            docs.push(doc.data());
        });

        let fb_wallet_address = docs[0].wallet_address;

        let web3 =  new Web3(process.env.RINKEBY_INFURA_URL)
        let signingAddress = web3.eth.accounts.recover(string, signature);

        if(fb_wallet_address === signingAddress) {
            const sdk = new ThirdwebSDK(
                new ethers.Wallet(
                    process.env.PRIVATE_KEY as string,
                    ethers.getDefaultProvider(process.env.RINKEBY_INFURA_URL)
                )
            );

            console.log("address verified", objekt_contract);

            // get contract
            const objektModule = await sdk.getDropModule(objekt_contract);
            const balance = await objektModule.balanceOf(signingAddress);

            if(balance.toNumber() > 0) {
                const q_objekts = query(collection(db, "v1_objekts"), where("contract_address", "==", objekt_contract));
                const objektsSnapshots = await getDocs(q_objekts);

                let objekts = [];

                console.log(objektsSnapshots);

                objektsSnapshots.forEach(doc => {
                    console.log(doc.data())
                    objekts.push(doc.data());
                })

                let objekt = objekts[0];

                let url=`https://ipfs.io/ipfs/${objekt.ipfs_uri}`;
                let objekt_metadata = (await axios.get(url)).data;

                if(objekt_metadata._link !== undefined) {
                    let decryptedLink = CryptoJS.AES.decrypt(objekt_metadata._link, objekt.decryption_key).toString(CryptoJS.enc.Latin1);

                    return res.status(200).json({
                        decryptedLink: decryptedLink
                    });
                } else {
                    let file_url = `https://ipfs.io/ipfs/${objekt_metadata.encrypted_file_cid}`;

                    console.log(file_url);

                    let encryptedFile = (await axios.get(file_url)).data;
                    let decryptedFile = CryptoJS.AES.decrypt(encryptedFile, objekt.decryption_key).toString(CryptoJS.enc.Latin1);

                    return res.status(200).json({
                        decryptedFile: decryptedFile
                    });
                }
            }
            
            return res.status(400).send("");

        } else {
            return res.status(400).send("wrong signature");
        }

    } else {
        return res.status(400).send("Wrong method bro")
    }
}