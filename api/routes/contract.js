const express = require('express');
const router = express.Router();
const hre = require("hardhat");
const fs = require("fs");
const { Alchemy, Network, TokenBalanceType } = require("alchemy-sdk");

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.send('OK');
  res.end();
});

router.post('/getContracts', async function(req, res, next) { 
  const arr = process.env.NETWORKS.split(',');
  //const finalRes = {};

  const mapping = {
    '5': {
      alchemy: Network.ETH_GOERLI,
      contract: "goerli",
      name: "Goerli Testnet",
      apiKey: process.env.ALCHEMY_APP_API_KEY_GOERLI,
    },
    '1337': {
      alchemy: null,
      contract: "localhost",
      name: "HardHat Local",
      apiKey: process.env.ALCHEMY_APP_API_KEY_GOERLI,
    },
    '80001': {
      alchemy: Network.MATIC_MUMBAI,
      contract: "mumbai",
      name: "Mumbai Testnet",
      apiKey: process.env.ALCHEMY_APP_API_KEY_MUMBAI,
    },
  };

  let tokens = [];
  if (mapping[req.body.network].alchemy) {
    const alchemy = new Alchemy({
      apiKey: mapping[req.body.network].apiKey,
      network: mapping[req.body.network].alchemy,
    });
    const [sender] = await hre.ethers.getSigners();
    // Get top 100
    //const balances = await alchemy.core.getTokenBalances(sender.address, {type: TokenBalanceType.DEFAULT_TOKENS});
    const balances = await alchemy.core.getTokenBalances(sender.address, {type: TokenBalanceType.DEFAULT_TOKENS});
  
    // The token address we want to query for metadata
    for (var i = 0; i < balances.tokenBalances.length; i++) {
      const metadata = await alchemy.core.getTokenMetadata(balances.tokenBalances[i].contractAddress);
      console.log("TOKEN METADATA");
      console.log(metadata);
      tokens.push({name: metadata.symbol, decimals: metadata.decimals, symbol: metadata.symbol, address: balances.tokenBalances[i].contractAddress, abi: await getContract(metadata.symbol, "sample")})
      if (tokens.length > 10) i = balances.tokenBalances.length;
    }
  }

  let finalRes = {
    "networkId": req.body.network,
    "networkName":mapping[req.body.network].name,
    "contract": {
      "name":"PaymentV1",
      "address": await getContract("PaymentV1", mapping[req.body.network].contract),
      "abi": await getContract("PaymentV1", mapping[req.body.network].contract, true),
    },
    "tokens": [
      {
        "name":"PPB",
        "symbol":"PPB",
        "decimals": 18,
        "address": await getContract("Token", mapping[req.body.network].contract),
        "abi": await getContract("Token", "sample"),
      },
      {
        "name":"BUSD",
        "symbol":"BUSD",
        "decimals": 18,
        "address": await getContract("TokenBis", mapping[req.body.network].contract),
        "abi": await getContract("TokenBis", "sample"),
      }
    ].concat(tokens)
  };

  res.json(finalRes); 
  res.end();
});

const getContract = async(contract, network = null, abi = false) => {
  if (!network) network = process.env.HARDHAT_NETWORK;
  
  const addressesFile = (network == 'sample') ? __dirname + "/../contracts/Sample.json" : 
  abi ? __dirname + "/../contracts/"+network+"/"+contract+".json" :
    __dirname + "/../contracts/"+network+"/contract-"+contract+"-address.json";

  if (!fs.existsSync(addressesFile)) {
    console.error("You need to deploy your contract first");
    return;
  }

  const addressJson = fs.readFileSync(addressesFile);
  const address = JSON.parse(addressJson);
  
  return abi || network == 'sample' ? address.abi : address.Token;
}

router.post('/faucets', async function(req, res, next) {
  console.log('faucets');
  const faucets = await hre.run('faucet', {contractName: "Token", contractAddress: await getContract("Token"), receiver: req.body.receiver});
  console.log('complete for token!');
  const faucetsBis = await hre.run('faucet', {contractName: "TokenBis", contractAddress: getContract("TokenBis"), receiver: req.body.receiver});
  console.log('complete for tokenBis!');
  res.send('OK');
  res.end();
});

module.exports = router;