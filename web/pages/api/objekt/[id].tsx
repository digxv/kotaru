import axios from "axios";
import { initializeApp } from "firebase/app";
import { collection, query, where, getDocs, getFirestore } from "firebase/firestore";

export default async (req, res) => {
    if(req.method === "GET") {   
        const { id } = req.query;

        const firebaseConfig = {
            apiKey: "AIzaSyA5TdftdcfvM5gB_eA15rxhiKvYTUj9bnY",
            authDomain: "kotaru-dev.firebaseapp.com",
            projectId: "kotaru-dev",
            storageBucket: "kotaru-dev.appspot.com",
            messagingSenderId: "59476093214",
            appId: "1:59476093214:web:e83273da01107e0ca1410f"
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