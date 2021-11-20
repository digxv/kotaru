import axios from "axios";
import { initializeApp } from "firebase/app";
import { collection, query, where, getDocs, getFirestore } from "firebase/firestore";

export default async (req, res) => {
    if(req.method === "GET") {   
        const { id } = req.query;

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

        const q = query(collection(db, "v1_objekts"), where("slug", "==", id));
        const querySnapshot = await getDocs(q);

        let objekts = [];

        querySnapshot.forEach(doc => {
            objekts.push(doc.data());
        });

        let objekt = objekts[0];
        
        let url=`https://ipfs.io/ipfs/${objekt.ipfs_uri}`;
        let objekt_metadata = (await axios.get(url)).data;

        return res.status(200).json({
            ...objekt_metadata,
            ipfs_uri: objekt.ipfs_uri,
            contract_address: objekt.contract_address
        })
        
    } else {
        res.status(400).json({ msg: "wrong method bro" });
    }
}  