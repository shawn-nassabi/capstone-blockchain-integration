const { ethers } = require("hardhat");

async function main() {
  const [backend] = await ethers.getSigners(); // Backend should be the deployer

  // Replace with your deployed contract address
  const tokenAddress = "0x1A935891a430b48fCfeF7f932951DFCC3F96BB82";
  const tokenContract = await ethers.getContractAt(
    "HealthDataToken",
    tokenAddress
  );

  const recipient = "0x7f2372B74a80A322CBA3d7ba7a1325010DF628Fe"; // Address of the user receiving tokens
  const amount = ethers.parseUnits("10", 18); // Adjust if needed (1 token)

  console.log(
    `Minting ${ethers.formatUnits(amount, 18)} HDT tokens to ${recipient}...`
  );

  // Backend calls mint()
  const tx = await tokenContract.connect(backend).mint(recipient, amount);
  await tx.wait();

  console.log(
    `✅ Minted ${ethers.formatUnits(amount, 18)} HDT to ${recipient}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
