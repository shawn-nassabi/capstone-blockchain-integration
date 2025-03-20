const { ethers } = require("hardhat");

async function main() {
  // Get the list of signers (accounts) available in the Hardhat environment
  // `signer` is the first account in the list, which is typically the default deployer account
  const [signer] = await ethers.getSigners();

  // Replace with your deployed contract address
  const rewardSystemContractAddress =
    "0xC5056F37A35DDd23A16B6aCA457f5f111374536f";
  const rewardSystem = await ethers.getContractAt(
    "HealthRewardSystem",
    rewardSystemContractAddress
  );

  // Ensure the backend address is set as the authorized backend
  // console.log("Setting the backend address...");
  // const setBackendTx = await rewardSystem.setBackendAddress(signer.address);
  // await setBackendTx.wait();
  // console.log(`✅ Backend address set to: ${signer.address}`);

  console.log("Submitting daily health data...");
  const tx = await rewardSystem.submitDailyDataOnBehalf(
    "0x7f2372B74a80A322CBA3d7ba7a1325010DF628Fe",
    10,
    false
  ); // 5 data types, user has a condition
  await tx.wait();

  console.log("✅ Daily Data Submitted!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
