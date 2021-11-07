import CryptoJS from "crypto-js";
import Web3 from "web3";
import { db } from "../../utils/firebase";
import ContractJSON from "../../../artifacts/contracts/Kotaru.sol/Kotaru.json";
import axios from "axios";
let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

export default async (req, response) => {
    if(req.method === "POST") {
        // https://mainnet.infura.io/v3/e14446aa2db54feb9068af263aabf2ea
        // for development: use ganache personal blockchain (http://127.0.0.1:7545)
        let web3 =  new Web3("https://rinkeby.infura.io/v3/e14446aa2db54feb9068af263aabf2ea");
        let _contractJSON: any = ContractJSON;
        let contract = new web3.eth.Contract(_contractJSON.abi, "0xe1EBD03808a6C080350501140Ac8Cf9740F6Ba47");

        let orderRef = db.collection("orders");
        let snapshot = await orderRef.where("string", "==", req.body.string).get();
        
        if (snapshot.empty) {
            return response.status(400).json({ msg: "this string haven't been generated" })
        } else {
            let doc: any = snapshot.docs[0];
            let doc_data: any = doc.data();

            let downloadBlock = await contract.methods.downloads(doc_data.download_id).call();
            let objekt = await contract.methods.objekts(downloadBlock.objekt_id).call();

            let signingAddress = web3.eth.accounts.recover(req.body.string, req.body.signature);

            console.log(signingAddress, downloadBlock.buyer);

            if(signingAddress === downloadBlock.buyer) {
                console.log("AUTHENTICATED")
                let url=`https://ipfs.io/ipfs/${objekt.ipfs_uri.substr(7)}`;
                let objekt_metadata = (await axios.get(url)).data;
                let decrypted = CryptoJS.AES.decrypt(objekt_metadata.decryption_key, "M&B&*#>*5X-sW27Ux)aH['A");
                let decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
                
                // use the decryptedString to decrypt the file and return
                let file_url = `https://ipfs.io/ipfs/${objekt_metadata.encrypted_file_cid}`;

                let encryptedFile = (await axios.get(file_url)).data;
                let decryptedFile = CryptoJS.AES.decrypt(encryptedFile, decryptedString).toString(CryptoJS.enc.Latin1);

                return response.status(200).json({
                    decrypted: decryptedString,
                    decryptedFile: decryptedFile
                });
            } else {
                return response.status(400).json({
                    msg: "UNAUTHENTICATED"
                })
            }
        }
    } else {
        response.status(400).json({ msg: "wrong method bro" });
    }
};