const { expect } = require("chai"); // Library for assertions (e.g., expect(...).to.equal(...))
const { ethers } = require("hardhat"); // Library for interacting with Ethereum contracts and wallets

/*
  Critical Test Cases:
  - Access control (owner/backend privileges)
  - Data submission (individual/batch)
  - Duplicate prevention
  - Data verification
*/

// 'Describe' groups related tests together
describe("HealthDataStorage", function () {
  let owner, backend, user1, user2; // Will hold ethereum wallet addresses for testing
  let contract; // Will hold a deployed instance of the HealthDataStorage contract
  const sampleHash = ethers.keccak256(ethers.toUtf8Bytes("data1")); // Sample hashed data for testing purposes

  // The 'beforeEach' hook runs before each test case to set up the environment
  beforeEach(async () => {
    // ethers.getSigners() gets a list of Ethereum wallets for testing
    [owner, backend, user1, user2] = await ethers.getSigners();
    const HealthDataStorage = await ethers.getContractFactory(
      // Compiles and loads the contract
      "HealthDataStorage"
    );
    contract = await HealthDataStorage.deploy(); // Deploys the contract to the local Hardhat network
    await contract.connect(owner).setBackendAddress(backend.address);
  });

  // Access Control Tests ------------------------------------------------
  describe("Access Control", () => {
    it("Should only allow owner to set backend", async () => {
      await expect(
        contract.connect(user1).setBackendAddress(user1.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should prevent non-backend from submitting on behalf", async () => {
      await expect(
        contract.connect(user1).submitDataOnBehalf(user1.address, sampleHash)
      ).to.be.revertedWith("Only backend can call this");
    });
  });

  // Data Submission Tests ------------------------------------------------
  describe("Data Submission", () => {
    it("Should store data via backend", async () => {
      await contract
        .connect(backend)
        .submitDataOnBehalf(user1.address, sampleHash);
      expect(await contract.verifyData(sampleHash, user1.address)).to.be.true;
    });

    it("Should prevent duplicate submissions", async () => {
      await contract
        .connect(backend)
        .submitDataOnBehalf(user1.address, sampleHash);
      await expect(
        contract.connect(backend).submitDataOnBehalf(user1.address, sampleHash)
      ).to.be.revertedWith("Hash already exists");
    });

    it("Should handle batch submissions", async () => {
      const hashes = Array(5)
        .fill()
        .map((_, i) => ethers.keccak256(ethers.toUtf8Bytes(`data${i}`)));
      await contract
        .connect(backend)
        .batchSubmitDataOnBehalf(user1.address, hashes);
      expect(await contract.verifyData(hashes[0], user1.address)).to.be.true;
    });

    it("Should reject oversized batches", async () => {
      const hashes = Array(101).fill(sampleHash);
      await expect(
        contract.connect(backend).batchSubmitDataOnBehalf(user1.address, hashes)
      ).to.be.revertedWith("Too many hashes in one batch");
    });
  });

  // Data Retrieval Tests ------------------------------------------------
  describe("Data Retrieval", () => {
    it("Should only allow owner to retrieve all hashes", async () => {
      await expect(
        contract.connect(user1).getHashes(user1.address)
      ).to.be.revertedWith("Not authorized");
    });
  });
});
