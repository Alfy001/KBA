require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

module.exports = {
  solidity: "0.8.26",
  networks: {
    local: {
      url: "http://127.0.0.1:8545/",
      accounts: [process.env.PRIVATE_KEY],
    },
    holesky: {
      url: process.env.ALCHEMY_API, // Infura Holesky endpoint
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
