import CryptoJS from "crypto-js";
import Web3 from "web3";
import { db } from "../../utils/firebase";
let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

export default async (req, response) => {
    if(req.method === "POST") {

        // https://mainnet.infura.io/v3/e14446aa2db54feb9068af263aabf2ea
        // for development: use ganache personal blockchain (http://127.0.0.1:7545)
        let web3 =  new Web3("https://mainnet.infura.io/v3/e14446aa2db54feb9068af263aabf2ea");

        // get signing address 
        // fetch order doc from db
        // check the for_user address in it
        // fetch the metadata_cid from ipfs
        // decrypt the decryption key 
        // send it as a response

        let orderRef = db.collection("orders");
        let snapshot = await orderRef.where("string", "==", req.body.string).get();
        
        if (snapshot.empty) {
            return response.status(400).json({ msg: "this string haven't been generated" })
        } else {
            let doc: any = snapshot.docs[0];
            let doc_data: any = doc.data();

            // get the signing address and compare it with the doc data
            let signingAddress = web3.eth.accounts.recover(req.body.string, req.body.signature);

            if(signingAddress === doc_data.for_user) {
                // fetch metadata file
                let Http = new XMLHttpRequest();
                let url=`https://ipfs.io/ipfs/${doc_data.for_metadata_cid}`;
                Http.open("GET", url);
                Http.send();

                Http.onloadend = async (e) => {
                    // parse the file content
                    let JSON_meta = JSON.parse(Http.responseText);
                    // decrypt the decryption key lol
                    let decrypted = CryptoJS.AES.decrypt(JSON_meta.decryption_key, "M&B&*#>*5X-sW27Ux)aH['A");
                    let decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
                    response.status(200).json({
                        decrypted: decryptedString
                    });
                }
            }
        }
    } else {
        response.status(400).json({ msg: "wrong method bro" });
    }
};