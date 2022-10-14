const express = require('express');
const router = express.Router();
const hre = require("hardhat");
const fs = require("fs");

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.send('OK');
  res.end();
});

router.get('/getContracts', async function(req, res, next) { 
  const arr = process.env.NETWORKS.split(',');
  const finalRes = {};
  let result = [
      {
        "networkId": "5",
        "networkName":"Goerli Test",
        "networkName":"Goerli Test",
        "contract": {
          "name":"PaymentV1",
          "address": await getContract("PaymentV1", "goerli"),
          "abi": await getContract("PaymentV1", "goerli", true),
        },
        "tokens":[
          {
            "name":"PPB",
            "address": await getContract("Token", "goerli"),
            "abi": await getContract("Token", "sample"),
          },
          {
            "name":"BUSD",
            "address": await getContract("TokenBis", "goerli"),
            "abi": await getContract("TokenBis", "sample"),
          }
        ]
      },
      {
        "networkId": "1337",
        "networkName":"HardHat Local",
        "contract": {
          "name":"PaymentV1",
          "address": await getContract("PaymentV1", "localhost"),
          "abi": await getContract("PaymentV1", "localhost", true),
        },
        "tokens":[
            {
              "name":"PPB",
              "address": await getContract("Token", "localhost"),
              "abi": await getContract("Token", "sample"),
            },
            {
              "name":"BUSD",
              "address": await getContract("TokenBis", "localhost"),
              "abi": await getContract("TokenBis", "sample"),
            }
        ]
      }
    ];
  for (var i = 0; i < arr.length; i++) {
    const arrTmp = result.filter(e => e.networkId.toString() === arr[i]);
    if (arrTmp.length === 1) {
      finalRes[arrTmp[0].networkId.toString()] = arrTmp[0];
    }
  }
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