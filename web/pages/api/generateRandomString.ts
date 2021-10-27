import { db } from "../../utils/firebase"
let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

export default async (req: any, response) => {

    if(req.method === "POST") {
        let txRef = db.collection("transactions");
        let snapshot = await txRef.where("tx_hash", "==", req.body.tx_hash).get();
        
        if (snapshot.empty) {
            return response.status(400).json({ msg: "user haven't paid yet" })
        } else {
            let doc: any = snapshot.docs[0];

            // fetch the metadata file using the cid provided by user
            // match value mentioned in metadata file with the transaction value
            // if they are equal, do the following
            // generate a random string
            // add it to the db with the info: string, user, tx_hash & metadata cid
            // they sign the random string & send the hash back to a separate route
            // extract the signer address from the hash and verify it with one who generated the string
            // if they are same, fetch the metadata file
            // pick the decryption key
            // decrypt it using the universal key and send the decrypted key as response

            let doc_data: any = doc.data();

            let Http = new XMLHttpRequest();
            let url=`https://ipfs.io/ipfs/${doc_data.metadata_cid}`;
            Http.open("GET", url);
            Http.send();

            Http.onloadend = async (e) => {
                let JSON_meta = JSON.parse(Http.responseText);

                let randomString = Math.random().toString(36);

                let res = await db.collection("orders").add({
                    string: randomString,
                    for_user: doc_data.from,
                    for_metadata_cid: req.body.metadata_cid,
                    tx_hash: req.body.tx_hash
                });

                let orderId = res.id;

                return response.status(200).json({
                    string: randomString
                })
            }
        }
    
    } else {
        response.status(400).json({ msg: "wrong method bro" })
    }
}  