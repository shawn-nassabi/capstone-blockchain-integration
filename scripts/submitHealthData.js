const { ethers } = require("hardhat");

async function main() {
  // Get the list of signers (accounts) available in the Hardhat environment
  // `signer` is the first account in the list, which is typically the default deployer account
  const [signer] = await ethers.getSigners();

  const dataStorageContractAddress =
    "0xf7e329b5ae0c495e000681661E8A84F0584a2413";

  // `ethers.getContractAt` connects to an already deployed contract
  const dataStorage = await ethers.getContractAt(
    "HealthDataStorage", // Name of the contract (must match the contract's ABI)
    dataStorageContractAddress // Address of the deployed contract
  );

  console.log("Submitting health data...");

  // Call the `submitData` function on the HealthDataStorage contract
  // The function takes a single argument: a hash of the health data
  // Here, we hash the string "sample health data" using keccak256 (a common hashing algorithm in Ethereum)
  const tx = await dataStorage.submitData(
    ethers.keccak256(ethers.toUtf8Bytes("sample health data"))
  );

  // Wait for the transaction to be mined (i.e., confirmed on the blockchain)
  await tx.wait();

  // Log a success message once the transaction is confirmed
  console.log("✅ Health Data Submitted!");
}

// Execute the main function
// If there's an error, log it and exit the process with a failure code (1)
main().catch((error) => {
  console.error(error); // Log the error details
  process.exit(1); // Exit the script with a non-zero status code to indicate failure
});
