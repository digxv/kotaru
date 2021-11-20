import Web3 from "web3";
import { initializeApp } from "firebase/app";
import { collection, getFirestore, addDoc } from "firebase/firestore";

export default async (req: any, response) => {

    if(req.method === "GET") {
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