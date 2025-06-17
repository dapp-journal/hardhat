import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { viem } from "hardhat";
import { getAddress, parseGwei } from "viem";

describe("AuthorManager", function () {

  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await viem.getWalletClients();

    const sol = await viem.deployContract("AuthorManager");

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
      it("Should add author with all fields correctly", async function () {
        const { sol, owner } = await loadFixture(deployFixture);
        
        await sol.write.add(['John', 'Doe', 'john.doe@example.com', '10.1234/example.2023']);
        const author = await sol.read.get([0n]);
        
        expect(author.firstName).to.equal('John');
        expect(author.lastName).to.equal('Doe');
        expect(author.email).to.equal('john.doe@example.com');
        expect(author.doi).to.equal('10.1234/example.2023');
        expect(author.user).to.equal(getAddress(owner.account.address));
        expect(author.timestamp).to.be.a('bigint');
      });

      it("Should add author without DOI correctly", async function () {
        const { sol, owner } = await loadFixture(deployFixture);
        
        await sol.write.add(['Jane', 'Smith', 'jane.smith@example.com']);
        const author = await sol.read.get([0n]);
        
        expect(author.firstName).to.equal('Jane');
        expect(author.lastName).to.equal('Smith');
        expect(author.email).to.equal('jane.smith@example.com');
        expect(author.doi).to.equal('');
        expect(author.user).to.equal(getAddress(owner.account.address));
      });

      it("Should increment total count after adding", async function () {
        const { sol } = await loadFixture(deployFixture);
        
        expect(await sol.read.getTotal()).to.equal(0n);
        await sol.write.add(['John', 'Doe', 'john@example.com']);
        expect(await sol.read.getTotal()).to.equal(1n);
        await sol.write.add(['Jane', 'Smith', 'jane@example.com']);
        expect(await sol.read.getTotal()).to.equal(2n);
        expect(await sol.read.getList()).to.have.lengthOf(2);
      });
    });

    describe("Update", function () {
      it("Should update author information partially", async function () {
        const { sol } = await loadFixture(deployFixture);
        
        await sol.write.add(['John', 'Doe', 'john@example.com', '10.1234/old.2023']);
        
        await sol.write.set([{
          idx: 0n,
          firstName: '',
          lastName: '',
          email: 'john.new@example.com',
          doi: '10.1234/new.2023'
        }]);

        const author = await sol.read.get([0n]);
        expect(author.firstName).to.equal('John'); // unchanged
        expect(author.lastName).to.equal('Doe'); // unchanged
        expect(author.email).to.equal('john.new@example.com'); // updated
        expect(author.doi).to.equal('10.1234/new.2023'); // updated
      });

      it("Should revert when updating non-existent author", async function () {
        const { sol } = await loadFixture(deployFixture);
        
        await expect(sol.write.set([{
          idx: 0n,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          doi: '10.1234/example.2023'
        }])).to.be.rejectedWith("Author index out of bounds");
      });
    });

    describe("Events", function () {
      it("Should emit an event on author added", async function () {
        const { sol, owner, publicClient } = await loadFixture(deployFixture);

        const hash = await sol.write.add(['John', 'Doe', 'john@example.com']);
        await publicClient.waitForTransactionReceipt({ hash });

        const authorAddedEvents = await sol.getEvents.authorAdded();
        expect(authorAddedEvents).to.have.lengthOf(1);
        expect(authorAddedEvents[0].args.authorId).to.be.a('bigInt');
        expect(authorAddedEvents[0].args.user).to.equal(getAddress(owner.account.address));
      });
    });
  });

});
