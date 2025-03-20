const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`🚀 Deploying contracts with the account: ${deployer.address}`);

  // Deploy HealthDataToken Contract
  const HealthDataToken = await ethers.getContractFactory("HealthDataToken");
  const healthDataToken = await HealthDataToken.deploy(deployer.address);
  await healthDataToken.waitForDeployment();
  console.log(`📜 HealthDataToken deployed to: ${healthDataToken.target}`);

  // Deploy HealthRewardSystem Contract
  const HealthRewardSystem = await ethers.getContractFactory(
    "HealthRewardSystem"
  );
  const healthRewardSystem = await HealthRewardSystem.deploy(
    healthDataToken.target
  );
  await healthRewardSystem.waitForDeployment();
  console.log(
    `🎯 HealthRewardSystem deployed to: ${healthRewardSystem.target}`
  );

  // Deploy HealthDataStorage Contract
  const HealthDataStorage = await ethers.getContractFactory(
    "HealthDataStorage"
  );
  const healthDataStorage = await HealthDataStorage.deploy();
  await healthDataStorage.waitForDeployment();
  console.log(`💾 HealthDataStorage deployed to: ${healthDataStorage.target}`);

  // Set up backend as authorized minter in HealthDataToken
  await healthDataToken.connect(deployer).transferOwnership(deployer.address); // Ensure deployer (backend) owns it
  console.log(
    `🔑 HealthDataToken ownership transferred to: ${deployer.address}`
  );

  console.log("\n✅ Deployment completed!");
}

// Run the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
