const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  const userAddress = signer.address; // The address of the connected wallet

  // Replace with your deployed contract address
  const rewardSystemAddress = "0xC5056F37A35DDd23A16B6aCA457f5f111374536f";
  const rewardSystem = await ethers.getContractAt(
    "HealthRewardSystem",
    rewardSystemAddress
  );

  console.log(`Fetching points for user: ${userAddress}...`);
  const points = await rewardSystem.userPoints(userAddress);

  console.log(`🟢 User Points: ${points.toString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
