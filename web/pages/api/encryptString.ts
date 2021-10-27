import CryptoJS from "crypto-js";

export default (req, res) => {
    if(req.method === "POST") {
        let encrypted = CryptoJS.AES.encrypt(req.body.string, "M&B&*#>*5X-sW27Ux)aH['A");
        let encryptedString = encrypted.toString();
        res.status(200).json({
            encryptedString: encryptedString
        });
    } else {
        res.status(400).json({ msg: "wrong method bro" })
    }
}  