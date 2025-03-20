const { ethers } = require("hardhat");

async function main() {
  // Read wallet address from environment variable
  const walletAddress = process.env.WALLET_ADDRESS;

  let targetAddress;

  if (walletAddress) {
    // Use the provided wallet address
    targetAddress = walletAddress;
    console.log(
      `Checking token balance for provided address: ${targetAddress}`
    );
  } else {
    // Use the default signer's address
    const [signer] = await ethers.getSigners();
    targetAddress = signer.address;
    console.log(`Checking token balance for default signer: ${targetAddress}`);
  }

  // Replace with your deployed contract address
  const tokenAddress = "0x1A935891a430b48fCfeF7f932951DFCC3F96BB82";
  const tokenContract = await ethers.getContractAt(
    "HealthDataToken",
    tokenAddress
  );

  // Check the balance
  const balance = await tokenContract.balanceOf(targetAddress);
  console.log(`Token Balance: ${ethers.formatUnits(balance, 18)} HDT`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
