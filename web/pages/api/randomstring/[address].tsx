import Web3 from "web3";
import { initializeApp } from "firebase/app";
import { collection, getFirestore, addDoc } from "firebase/firestore";

export default async (req: any, response) => {

    if(req.method === "GET") {
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

        let randomString = Math.random().toString(36);

        try {
            let fb_save = await addDoc(collection(db, "signatures"), {
                wallet_address: req.query.address,
                string: randomString
            });
    
            return response.status(200).json({
                string: randomString
            })
        } catch {
            return response.status(400).json({msg: "error"})
        }   
    } else {
        return response.status(400).json({ msg: "wrong method bro" })
    }
}  