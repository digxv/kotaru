const I = require("ipfs-http-client");

const ipfs = I.create({ host: "ipfs.infura.io", port: 5001, protocol: "https" });

export default ipfs