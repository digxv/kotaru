const main = async () => {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const Kotaru = await ethers.getContractFactory("Kotaru");
    const kotaru = await Kotaru.deploy();

    console.log("Contract address:", kotaru.address);
}

main().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
})