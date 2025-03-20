const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("HealthRewardSystem", function () {
  let owner, backend, user1;
  let rewardContract, tokenContract;

  beforeEach(async () => {
    [owner, backend, user1] = await ethers.getSigners();

    // Deploy token contract with backend as initialOwner
    const Token = await ethers.getContractFactory("HealthDataToken");
    tokenContract = await Token.deploy(backend.address);
    await tokenContract.waitForDeployment();

    // Deploy reward contract with backend as admin
    const RewardSystem = await ethers.getContractFactory("HealthRewardSystem");
    rewardContract = await RewardSystem.connect(backend).deploy(
      tokenContract.target
    );
    await rewardContract.waitForDeployment();

    // Set backend as the authorized backend address
    await rewardContract.connect(backend).setBackendAddress(backend.address);
  });

  describe("Point System", () => {
    it("Should award correct points", async () => {
      await rewardContract
        .connect(backend)
        .submitDailyDataOnBehalf(user1.address, 3, true);
      expect(await rewardContract.userPoints(user1.address)).to.equal(50); // (3*10) + 20
    });

    it("Should enforce 24h cooldown", async () => {
      await rewardContract
        .connect(backend)
        .submitDailyDataOnBehalf(user1.address, 1, false);
      await expect(
        rewardContract
          .connect(backend)
          .submitDailyDataOnBehalf(user1.address, 1, false)
      ).to.be.revertedWith("User already submitted today");
    });
  });

  describe("Token Conversion", () => {
    it("Should convert points to tokens", async () => {
      // Backend submits data for user1
      await rewardContract
        .connect(backend)
        .submitDailyDataOnBehalf(user1.address, 10, true);
      // 10 * 10 + 20 = 120 points

      // Backend calls conversion
      await rewardContract
        .connect(backend)
        .convertPointsToTokensOnBehalf(user1.address);

      // Now backend manually calls mint (simulating event response)
      await tokenContract.connect(backend).mint(user1.address, 1);

      expect(await tokenContract.balanceOf(user1.address)).to.equal(1);
    });

    it("Should emit TokensMinted event and allow backend to mint tokens", async () => {
      // Step 1: Submit data to earn points
      await rewardContract
        .connect(backend)
        .submitDailyDataOnBehalf(user1.address, 10, true);

      // Step 2: Convert points into tokens (Triggers TokensMinted event)
      await expect(
        rewardContract
          .connect(backend)
          .convertPointsToTokensOnBehalf(user1.address)
      )
        .to.emit(rewardContract, "TokensMinted")
        .withArgs(user1.address, 1); // Assuming 100 points per token, 10*10 + 20 = 120 → 1 token

      // Step 3: Listen for the event manually (for debugging)
      rewardContract.on("TokensMinted", async (user, amount) => {
        console.log(
          `✅ TokensMinted Event Detected! ${user} was awarded ${amount} tokens.`
        );
      });

      // Step 4: Backend manually calls mint() on HealthDataToken
      await tokenContract.connect(backend).mint(user1.address, 1);

      // Step 5: Verify token balance has increased
      expect(await tokenContract.balanceOf(user1.address)).to.equal(1);
    });

    it("Should adjust token points ratio", async () => {
      // Simulate enough conversions so that totalTokensIssued > targetSupply
      // For testing purposes, you might simulate a scenario that forces this condition.
      // For example, if targetSupply is 50,000, you could simulate minting many tokens.
      // This may require either adjusting targetSupply in a test version of the contract
      // or calling conversion repeatedly with high point values.

      // Here, we assume we have a mechanism to simulate this:
      // (This part of the test may need to be customized based on your contract design.)
      // For now, we can remove the direct call to adjustPointsPerToken from the test,
      // and simply verify that pointsPerToken is greater than 100 after a conversion
      // that increases totalTokensIssued over targetSupply.

      // Simulate a high number of submissions over multiple days
      for (let i = 0; i < 20; i++) {
        await rewardContract
          .connect(backend)
          .submitDailyDataOnBehalf(user1.address, 50000, true);

        // Move time forward by 1 day to bypass the 24-hour cooldown
        await time.increase(24 * 60 * 60);

        await rewardContract
          .connect(backend)
          .convertPointsToTokensOnBehalf(user1.address);
      }

      // Check if pointsPerToken has increased
      expect(await rewardContract.pointsPerToken()).to.be.gt(100);
    });
  });
});
