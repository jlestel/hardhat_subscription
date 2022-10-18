//require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-network-helpers");
require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
require('hardhat-contract-sizer');
//require("@nomiclabs/hardhat-etherscan");


// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");
require("./tasks/rebill");
require("./tasks/kickUnpaid");

const ALCHEMY_GOERLI_API_KEY = "s_7N0dmQWg2x-ZZ3zZsQEzC0aM5F01mI";
const ALCHEMY_MUMBAY_API_KEY = "O5QqGlDXFYuko1squ-_1tsuxINrqtUa9";

// Replace this private key with your Goerli account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Beware: NEVER put real Ether into testing accounts
const PRIVATE_KEY_OWNER = "730d1e14cc723f319e730ca9fa69be76b5129160615050123c1bbc8d3dd1a173";
const PRIVATE_KEY_TESTER = "272c3de52e6820355fe05f05a590bb8938e11b39aa66712656189406feac76b0";
const PRIVATE_KEY_TESTER2 = "ef3ff9910e6771992f0d0856fa04f01fbf90bcba0c0ce441ef3764720980f4fd";

// Faucets: https://faucets.chain.link/

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  paths: {
    //artifacts: './src/artifacts',
  },
  networks: {
    hardhat: {
      chainId: 1337, // We set 1337 to make interacting with MetaMask simpler
      //allowUnlimitedContractSize: true,
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_GOERLI_API_KEY}`,
      accounts: [PRIVATE_KEY_OWNER, PRIVATE_KEY_TESTER, PRIVATE_KEY_TESTER2],
      gas: 'auto',
      gasPrice: 'auto',
      gasMultiplier: 2
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_MUMBAY_API_KEY}`,
      accounts: [PRIVATE_KEY_OWNER, PRIVATE_KEY_TESTER, PRIVATE_KEY_TESTER2],
      gas: 'auto',
      gasPrice: 'auto',
      gasMultiplier: 2
    },
    /*goerli: {
      url: `https://goerli.infura.io/v3/${ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY],
      gas: 'auto',
      gasPrice: 'auto',
      gasMultiplier: 2
    }*/
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "DCK4DQ71SB6ZIQUTISHHVSAKVYTFF999N2"
  },
  settings: { optimizer: { enabled: true, runs: 200, details: { yul: false }, }, }
};
