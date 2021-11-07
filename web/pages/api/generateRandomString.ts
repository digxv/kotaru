import Web3 from "web3";
import ContractJSON from "../../../artifacts/contracts/Kotaru.sol/Kotaru.json";
import firebase from 'firebase/app'
import 'firebase/firestore'

export default async (req: any, response) => {

    if(req.method === "POST") {
        let firebaseConfig = {
            apiKey: process.env.FB_API_KEY,
            authDomain: process.env.FB_AUTH_DOMAIN,
            projectId: process.env.FB_PROJECT_ID,
            storageBucket: process.env.FB_STORAGE_BUCKET,
            messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
            appId: process.env.FB_APP_ID
        };

        let app

        if(!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
        }

        let db = firebase.firestore();

        let web3 =  new Web3(process.env.RINKEBY_INFURA_URL);
        let _contractJSON: any = ContractJSON;
        let contract = new web3.eth.Contract(_contractJSON.abi, "0xe1EBD03808a6C080350501140Ac8Cf9740F6Ba47");
        let downloadBlock = await contract.methods.downloads(req.body.download_id).call();
        let randomString = Math.random().toString(36);
        let fb_save = await db.collection("orders").add({
            download_id: req.body.download_id,
            buyer: downloadBlock.buyer,
            string: randomString
        })
        return response.status(200).json({
            download_id: req.body.download_id,
            buyer: downloadBlock.buyer,
            string: randomString
        })
    } else {
        response.status(400).json({ msg: "wrong method bro" })
    }
}  