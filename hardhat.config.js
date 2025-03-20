require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Import dotenv to manage environment variables

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    amoy: {
      url: "https://rpc-amoy.polygon.technology", // Amoy RPC URL
      accounts: [process.env.PRIVATE_KEY], // Load private key from .env
    },
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY, // Needed for contract verification
  },
};
