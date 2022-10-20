const express = require('express');
const router = express.Router();
const hre = require("hardhat");
const fs = require("fs");
const { Alchemy, Network, TokenBalanceType } = require("alchemy-sdk");
const mapping = {
  '5': {
    alchemy: Network.ETH_GOERLI,
    key: "goerli",
    name: "Goerli Testnet",
    apiKey: process.env.ALCHEMY_APP_API_KEY_GOERLI,
    url: 'https://eth-goerli.g.alchemy.com/v2/',
    nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'GoerliETH' },
    rpcUrls: ['https://goerli.infura.io/v3/'],
    blockExplorerUrls: ['https://goerli.etherscan.io'],
  },
  '1337': {
    alchemy: null,
    key: "localhost",
    name: "HardHat Local",
    apiKey: process.env.ALCHEMY_APP_API_KEY_GOERLI,
    url: 'https://eth-goerli.g.alchemy.com/v2/',
    nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'LocalETH' },
    rpcUrls: ['http://localhost:8545'],
    blockExplorerUrls: [],
  },
  '80001': {
    alchemy: Network.MATIC_MUMBAI,
    key: "mumbai",
    name: "Mumbai Testnet",
    apiKey: process.env.ALCHEMY_APP_API_KEY_MUMBAI,
    url: 'https://polygon-mumbai.g.alchemy.com/v2/',
    nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
    blockExplorerUrls: ['https://polygonscan.com/'],
  },
};

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.send('OK');
  res.end();
});

router.get('/getContracts', async function(req, res, next) { 
  const r = mapping;
  r['5'].smartContractAddress = await getContract("PaymentV1", mapping['5'].key);
  r['5'].abi = await getContract("PaymentV1", mapping['5'].key, true);
  r['1337'].smartContractAddress = await getContract("PaymentV1", mapping['1337'].key);
  r['1337'].abi = await getContract("PaymentV1", mapping['1337'].key, true);
  r['80001'].smartContractAddress = await getContract("PaymentV1", mapping['80001'].key);
  r['80001'].abi = await getContract("PaymentV1", mapping['80001'].key, true);
  res.json(r);
  res.end();
});
router.get('/plan/:id', async function(req, res, next) {
  const network = '80001';
  const contract = await getContract("PaymentV1", mapping[network].key)
  const payment = await hre.ethers.getContractAt("PaymentV1", contract);
  const plans = await payment.getPlans(false);
  const plan = plans.filter(e => e.planId.toString() == req.params.id)[0];

  const alchemy = new Alchemy({
    apiKey: mapping[network].apiKey,
    network: mapping[network].alchemy,
  });
  
  const metadata = await alchemy.core.getTokenMetadata(plan.token.toString());
  res.json({
    network: mapping[network].key,
    id: plan.planId.toString(),
    wallet: plan.merchant,
    interval: plan.frequency.toString(),
    amount: plan.amount.toString() / Math.pow(10, metadata.decimals),
    currencyCode: metadata.symbol,
    currencyAddress: plan.token.toString(),
    currencyAbi: await getContract(metadata.symbol, "sample"),
    fee: 2,
    priceLimitPercentage: 20,
  });
  res.end();
});

router.post('/getContracts', async function(req, res, next) { 
  const arr = process.env.NETWORKS.split(',');
  // get tokens to verify
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
      const metadata = await alchemy.core.getTokenMetadata(balances.tokenBalances[i].keyAddress);
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
      "address": await getContract("PaymentV1", mapping[req.body.network].key),
      "abi": await getContract("PaymentV1", mapping[req.body.network].key, true),
    },
    "tokens": [
      {
        "name":"PPB",
        "symbol":"PPB",
        "decimals": 18,
        "address": await getContract("Token", mapping[req.body.network].key),
        "abi": await getContract("Token", "sample"),
      },
      {
        "name":"BUSD",
        "symbol":"BUSD",
        "decimals": 18,
        "address": await getContract("TokenBis", mapping[req.body.network].key),
        "abi": await getContract("TokenBis", "sample"),
      }
    ].concat(tokens),
    "otherNetworks": arr.filter(e => e != req.body.network).map(e => {
      return {
        chainId: e,
        chainName: mapping[e].name,
        nativeCurrency: mapping[e].nativeCurrency,
        rpcUrls: mapping[e].rpcUrls,
        url: mapping[e].url,
        apiKey: mapping[e].apiKey,
        blockExplorerUrls: mapping[e].blockExplorerUrls,
      } 
    })
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