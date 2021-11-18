import axios from "axios";
import firebase from "firebase";

export default async (req, res) => {
    if(req.method === "POST") {   
        const { slug } = req.data;

        let firebaseConfig = {
            apiKey: process.env.FB_API_KEY,
            authDomain: process.env.AUTH_DOMAIN,
            projectId: process.env.PROJECT_ID,
            storageBucket: process.env.STORAGE_BUCKET,
            messagingSenderId: process.env.MESSAGING_SENDER_ID,
            appId: process.env.FB_APP_ID
        };

        let app

        if(!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
        }

        let db = firebase.firestore();

        let fb_doc = await db.collection("v1_objekt").doc(slug).get();
        let url=`https://ipfs.io/ipfs/${fb_doc.data().ipfs_uri.ipfs_uri.substr(7)}`;
        let objekt_metadata = (await axios.get(url)).data;

        return res.status(200).json({
            ...objekt_metadata,
            contract_address: fb_doc.data().contract_address
        })
        
    } else {
        res.status(400).json({ msg: "wrong method bro" });
    }
}  