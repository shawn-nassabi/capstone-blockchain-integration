const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();

  // Replace with your deployed contract address
  const rewardSystemAddress = "0xC5056F37A35DDd23A16B6aCA457f5f111374536f";
  const rewardSystem = await ethers.getContractAt(
    "HealthRewardSystem",
    rewardSystemAddress
  );

  console.log("Converting points into tokens...");
  const tx = await rewardSystem.convertPointsToTokensOnBehalf(
    "0x7f2372B74a80A322CBA3d7ba7a1325010DF628Fe"
  );
  await tx.wait();

  console.log("✅ Points Converted to Tokens!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
