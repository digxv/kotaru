export default (req, res) => {
    if(req.method === "POST") {   
        const { name, ipfs_uri, decryption_key } = req.body;

        console.log(name, ipfs_uri, decryption_key);
    } else {
        res.status(400).json({ msg: "wrong method bro" });
    }
}  