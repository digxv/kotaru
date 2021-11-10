import CryptoJS from "crypto-js";

export default (req, res) => {
    if(req.method === "POST") {
        let encrypted = CryptoJS.AES.encrypt(req.body.string, process.env.KEY_THAT_DO_WONDERS);
        let encryptedString = encrypted.toString();
        res.status(200).json({
            encryptedString: encryptedString
        });
    } else {
        res.status(400).json({ msg: "wrong method bro" })
    }
}  