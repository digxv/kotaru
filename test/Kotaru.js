const { expect } = require("chai");

describe("Kotaru contract", () => {
    let Kotaru, kotaru, ac1, ac2, acs;

    beforeEach(async () => {
        Kotaru = await ethers.getContractFactory("Kotaru");
        kotaru = await Kotaru.deploy();
        [ac1, ac2, ...acs] = await ethers.getSigners();
    });

    describe("Deployment", () => {
        it("deploys successfully", async () => {
            const address = await kotaru.address;
            expect(address).to.be.not.null;
            expect(address).to.be.not.undefined;
            expect(address).to.be.not.undefined;
            expect(address).to.be.not.equal(0x0);
            expect(address).to.be.a("string");
            expect(acs).to.not.undefined;
            expect(acs).to.be.length.above(0);
        })

        it("has a name", async() => {
            const name = await kotaru.name();
            expect(name).to.equal("Kotaru");
        })
    })

    describe("Objekts", () => {
        let publishTx, buyTx, objektCount, totalDownloads;

        before(async () => {
            publishTx = await kotaru.connect(ac1).publishObjekt("Objekt #1", "ipfs://xxxx", 0, {
                from: ac1.address
            });

            buyTx = await kotaru.connect(ac2).buyObjekt(0, {
                from: ac2.address
            });

            objektCount = await kotaru.objektCount();
            totalDownloads = await kotaru.totalDownloads();
        });

        it("publish objekt", async () => {
            expect(publishTx.hash).to.be.a("string");
            expect(objektCount).equal(1);

            let receipt = await publishTx.wait();
            let logs = receipt.events[objektCount - 1].args;
            expect(logs).to.be.an("array");
            expect(logs).to.be.length.above(0);

            expect(logs.id.toNumber()).is.equal(objektCount);
            expect(logs.name).is.equal("Objekt #1");
            expect(logs.ipfs_hash).is.equal("ipfs://xxxx");
            expect(logs.price).is.equal(0);
            expect(logs.downloads).is.equal(0);
            expect(logs.publisher).is.equal(ac1.address);
        });

        it("buy objekt", async () => {
            expect(buyTx.hash).to.be.a("string");

            let receiptPub = await publishTx.wait();
            let logsPub = receiptPub.events[objektCount - 1].args;

            let receipt = await buyTx.wait();
            let logs = receipt.events[totalDownloads - 1].args;
            expect(logs).to.be.an("array");
            expect(logs).to.be.length.above(0);

            expect(logs.id.toNumber()).is.equal(totalDownloads);
            expect(logs.buyer).is.equal(ac2.address);
            expect(logs.objekt_id.toNumber()).is.equal(objektCount);
        });
    })
})