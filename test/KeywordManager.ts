import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { viem } from "hardhat";
import { getAddress, parseGwei } from "viem";

describe("KeywordManager", function () {

  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await viem.getWalletClients();

    const sol = await viem.deployContract("KeywordManager");

    const publicClient = await viem.getPublicClient();

    return {
      sol,
      owner,
      otherAccount,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { sol, owner } = await loadFixture(deployFixture);

      expect(await sol.read.owner()).to.equal(
        getAddress(owner.account.address)
      );
    });
  });

  describe("Add&Get", function () {
    describe("Validations", function () {
      it("Should add keyword correctly", async function () {
        const { sol, owner } = await loadFixture(deployFixture);
        
        await sol.write.add(['test']);
        const keyword = await sol.read.get([0n]);
        
        expect(keyword.name).to.equal('test');
        expect(keyword.user).to.equal(getAddress(owner.account.address));
        expect(keyword.timestamp).to.be.a('bigint');
      });

      it("Should increment total count after adding", async function () {
        const { sol } = await loadFixture(deployFixture);
        
        expect(await sol.read.getTotal()).to.equal(0n);
        await sol.write.add(['test1']);
        expect(await sol.read.getTotal()).to.equal(1n);
        await sol.write.add(['test2']);
        expect(await sol.read.getTotal()).to.equal(2n);
        expect(await sol.read.getList()).to.have.lengthOf(2);
      });
    });

    describe("Events", function () {
      it("Should emit an event on added", async function () {
        const { sol, owner, publicClient } = await loadFixture(deployFixture);

        const hash = await sol.write.add(['test']);
        await publicClient.waitForTransactionReceipt({ hash });

        const keywordAddedEvents = await sol.getEvents.keywordAdded();
        expect(keywordAddedEvents).to.have.lengthOf(1);
        expect(keywordAddedEvents[0].args.keywordId).to.be.a('bigInt');
        expect(keywordAddedEvents[0].args.user).to.equal(getAddress(owner.account.address));
      });
    });
  });

});
