const { expect, assert } = require("chai");

describe("Kotaru contract", () => {
    let Kotaru, kotaru, accounts;

    beforeEach(async () => {
        Kotaru = await ethers.getContractFactory("Kotaru");
        kotaru = await Kotaru.deploy();
        accounts = await ethers.getSigners();
    });

    describe("Deployment", () => {
        it("deploys successfully", async () => {
            const address = await kotaru.address;
            expect(address).to.be.not.null;
            expect(address).to.be.not.undefined;
            expect(address).to.be.not.undefined;
            expect(address).to.be.not.equal(0x0);
            expect(address).to.be.a("string");
            expect(accounts).to.not.undefined;
            expect(accounts).to.be.length.above(0);
        })

        it("has a name", async() => {
            const name = await kotaru.name();
            expect(name).to.equal("Kotaru");
        })
    })

    describe("Objects", () => {
        let tx, objectCount;

        before(async () => {
            tx = await kotaru.publishObject("Object #1", "ipfs://xxxx", 0, {
                from: accounts[0].address
            });
            objectCount = await kotaru.objectCount();
        });

        it("publish object", async () => {
            expect(tx.hash).to.be.a("string");
            expect(objectCount).equal(1);

            const receipt = await tx.wait();
            const logs = receipt.events[objectCount - 1].args;
            expect(logs).to.be.an("array");
            expect(logs).to.be.length.above(0);

            expect(logs.id.toNumber()).is.equal(objectCount);
            expect(logs.name).is.equal("Object #1");
            expect(logs.ipfs_hash).is.equal("ipfs://xxxx");
            expect(logs.price).is.equal(0);
            expect(logs.publisher).is.equal(accounts[0].address);
        });
    })
})