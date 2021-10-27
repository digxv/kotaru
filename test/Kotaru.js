const { expect, assert } = require("chai");

describe("Kotaru contract", () => {
    let Kotaru, kotaru, accounts;

    beforeEach(async () => {
        Kotaru = await ethers.getContractFactory("Kotaru");
        kotaru = await Kotaru.deploy();
        accounts = await ethers.getSigners();
    });

    describe("Deployment", () => {
        it("Should be deployed", async () => {
            expect(kotaru.address).to.be.a("string");
            expect(accounts).to.not.undefined;
            expect(accounts).to.be.length.above(0);
        })
    })

    describe("Objects", () => {
        let tx, objectCount;

        before(async () => {
            tx = await kotaru.publishObject("Object #1", "ipfs://xxxx", 0);
            objectCount = await kotaru.objectCount();
        });

        it("Should publish an object", async () => {
            expect(tx.hash).to.be.a("string");
            console.log(tx);
            
            // const { logs } = tx;
            // assert.ok(Array.isArray(logs));
            // assert.equal(objectCount, 1);
            // const e = tx.logs[0].args;
            // assert.equal(e.id.toNumber(), 1, "ID is correct");
            // assert.equal(e.name, "Object #1", "name is correct");
            // assert.equal(e.ipfs, "ipfs://xxxx", "IPFS URI is correct");
            // assert.equal(e.price, 0, "price is correct")
            // assert.equal(e.publisher, accounts[0].address, "publisher is correct");
        });
    })
})