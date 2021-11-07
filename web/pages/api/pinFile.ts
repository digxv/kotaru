import pinataSDK from "@pinata/sdk";
const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);

export default (req, res) => {
    if(req.method === "POST") {   
        pinata.pinByHash(req.body.hash).then(result => {
            res.status(200).json({
                msg: "pinned to ipfs"
            });
        }).catch(error => {
            res.status(400).json({
                msg: "failed to pin"
            });
        });
    } else {
        res.status(400).json({ msg: "wrong method bro" });
    }
}  