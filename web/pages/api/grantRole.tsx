import { ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from "ethers";

export default async (req, res) => {
    if(req.method === "POST") {   
        const sdk = new ThirdwebSDK(
            new ethers.Wallet(
                process.env.PRIVATE_KEY as string,
                ethers.getDefaultProvider(process.env.RINKEBY_INFURA_URL)
            )
        );

        const appMod = await sdk.getAppModule("0x2998e811b64c365646818f1e7F8D8333f79f2C1b");

        const roleMembers = await appMod.getRoleMembers(req.body.role);

        if(roleMembers.includes(req.body.address)) {
            return res.status(200).json({
                msg: "Address is already whitelisted."
            })
        } else {
            await appMod.grantRole(req.body.role, req.body.address);

            return res.status(200).json({
                msg: "User granted with the role."
            })
        }
    } else {
        res.status(400).json({ msg: "wrong method bro" });
    }
}  