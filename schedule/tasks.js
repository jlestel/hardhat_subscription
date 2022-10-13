const hre = require("hardhat");

'use strict'

exports.rebill = async(event, context) => {

    console.log('OK');

    const network = process.env.HARDHAT_NETWORK;
    const contract = "PaymentV1";
    
    const fs = require("fs");
    const addressesFile =
      __dirname + "/contracts_generated/"+network+"/contract-"+contract+"-address.json";

    if (!fs.existsSync(addressesFile)) {
      console.error("You need to deploy your contract first");
      return;
    }

    const addressJson = fs.readFileSync(addressesFile);
    const address = JSON.parse(addressJson);
    console.log(address.Token);

    const myContract = await hre.ethers.getContractAt(contract, address.Token);
    const instance = await myContract.deployed();
    console.log(instance);

    const rebill = await hre.run('rebill', {contractName: contract, contractAddress: address.Token});
    console.log('complete!');
    
}
