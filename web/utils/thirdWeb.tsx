import { ThirdwebSDK } from "@3rdweb/sdk";

export let thirdWeb: any;

export const initThirdWeb = (signer) => {
    thirdWeb = new ThirdwebSDK(signer);
}