import Web3 from "web3";
import { db } from "../../utils/firebase"
import ContractJSON from "../../../artifacts/contracts/Kotaru.sol/Kotaru.json";
let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

export default async (req: any, response) => {

    if(req.method === "POST") {
        let web3 =  new Web3("https://rinkeby.infura.io/v3/e14446aa2db54feb9068af263aabf2ea");
        let _contractJSON: any = ContractJSON;
        let contract = new web3.eth.Contract(_contractJSON.abi, "0xe1EBD03808a6C080350501140Ac8Cf9740F6Ba47");
        let downloadBlock = await contract.methods.downloads(req.body.download_id).call();
        let randomString = Math.random().toString(36);
        let fb_save = await db.collection("orders").add({
            download_id: req.body.download_id,
            buyer: downloadBlock.buyer,
            string: randomString
        })
        return response.status(200).json({
            download_id: req.body.download_id,
            buyer: downloadBlock.buyer,
            string: randomString
        })
    } else {
        response.status(400).json({ msg: "wrong method bro" })
    }
}  