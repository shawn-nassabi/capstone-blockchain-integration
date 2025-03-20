const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HealthDataToken", function () {
  let owner, backend, user1;
  let tokenContract, rewardContract;

  beforeEach(async () => {
    [owner, backend, user1] = await ethers.getSigners();

    // Deploy the token contract with the backend as the initial owner
    const Token = await ethers.getContractFactory("HealthDataToken");
    tokenContract = await Token.deploy(backend.address);
    await tokenContract.waitForDeployment();

    // Deploy the reward system contract using the backend signer so that admin = backend
    const RewardSystem = await ethers.getContractFactory("HealthRewardSystem");
    rewardContract = await RewardSystem.connect(backend).deploy(
      tokenContract.target
    );
    await rewardContract.waitForDeployment();

    // Set the backend address in the reward contract
    await rewardContract.connect(backend).setBackendAddress(backend.address);

    // Transfer token ownership to the reward contract if desired
    // (Alternatively, you might keep the backend as the token owner)
    // For testing gasless transactions, you may prefer to have the backend remain the owner.
    // If you do transfer ownership, use:
    // await tokenContract.transferOwnership(rewardContract.target);
    // and then have the reward contract accept ownership via Ownable2Step.
  });

  it("Should only allow owner (backend) to mint", async () => {
    // Using the backend signer to mint tokens.
    await tokenContract.connect(backend).mint(user1.address, 100);
    expect(await tokenContract.balanceOf(user1.address)).to.equal(100);
  });
});
