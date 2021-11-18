import firebase from "firebase";
import slugify from "slugify";

export default async (req, res) => {
    if(req.method === "POST") {   
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

        const { name, ipfs_uri, decryption_key, contract_address } = req.body;
        const slug = slugify(`${name} ${makeid(10)}`);

        console.log(name, ipfs_uri, decryption_key, slug);

        let fb_doc = await db.collection("v1_objekt").add({
            ipfs_uri: ipfs_uri,
            decryption_key: decryption_key,
            objekt_name: name,
            contract_address: contract_address,
            slug: slug
        });

        console.log(fb_doc.id);

        return res.status(200).json({
            slug: slug
        })
    } else {
        res.status(400).json({ msg: "wrong method bro" });
    }
}

const makeid = (length) => {
    let result = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}