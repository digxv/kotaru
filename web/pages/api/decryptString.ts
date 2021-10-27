import CryptoJS from "crypto-js";

export default (req, res) => {
    if(req.method === "POST") {
        let decrypted = CryptoJS.AES.decrypt(req.body.encrypted, "M&B&*#>*5X-sW27Ux)aH['A");
        let decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
        res.status(200).json({
            decrypted: decryptedString
        });
    } else {
        res.status(400).json({ msg: "wrong method bro" })
    }
}  