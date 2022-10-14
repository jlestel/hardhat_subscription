const hre = require("hardhat");
const fs = require("fs");

'use strict'

exports.rebill = async(event, context) => {

    console.log('Rebill');

    const network = process.env.HARDHAT_NETWORK;
    const contract = "PaymentV1";
    
    const addressesFile =
      __dirname + "/contracts/"+network+"/contract-"+contract+"-address.json";

    if (!fs.existsSync(addressesFile)) {
      console.error("You need to deploy your contract first");
      return;
    }

    const addressJson = fs.readFileSync(addressesFile);
    const address = JSON.parse(addressJson);
    console.log(address.Token);

    const payment = await hre.ethers.getContractAt(contract, address.Token);
    const instance = await payment.deployed();
    console.log(instance);

    //const rebill = await hre.run('rebill', {contractName: contract, contractAddress: address.Token});
    const sub = await payment.getSubscriptions(false);
    const plans = await payment.getPlans(false);
    /*const increaseGasLimit = (estimatedGasLimit) => {
      return estimatedGasLimit.mul(300).div(100) // increase by 30%
    }*/
    console.log(sub.length);
    for(let i = 0; i < sub.length; i++) {
      try {
        //const estimatedGas = await payment.estimateGas.pay(sub[i].subscriber, sub[i].planId, {from: sub[i].merchant})
        //const tx = await payment.method(args, { gasLimit: increaseGasLimit(estimatedGas) })
        if (sub[i].nextPayment.toString() !== '0') {
          const date = new Date();
          const time = parseInt(date.getTime()/1000);
          if ( (time - parseInt(sub[i].nextPayment)) > 0) {
            const plan = plans.filter(e => e.planId.toString() == sub[i].planId.toString())[0];
            if (plan.planType.toString() != '3') { // no need to renew by duration plan
              console.log("Renew ...",i, sub[i].subscriber, "on plan ", sub[i].planId.toString(), parseInt(sub[i].nextPayment), parseInt(date.getTime()/1000));
              const tx = await payment.pay(sub[i].subscriptionId.toString(), { /*from: sub[i].subscriber, */gasLimit: 150000});
              const receipt = await tx.wait();
              console.log("Renewed !",i, sub[i].subscriber, "on plan ", sub[i].planId.toString(), parseInt(sub[i].nextPayment), parseInt(date.getTime()/1000));
            } else {
              console.log('Duration subscription: no need to pay now...', i, sub[i].planId.toString(), time - parseInt(sub[i].nextPayment.toString()));
            }
          } else {
            console.log('No need to pay...', i, sub[i].planId.toString(), time - parseInt(sub[i].nextPayment.toString()));
          }
        }
      } catch (e) {
        if (e.message.indexOf('this subscription does not exist') === -1) {
          console.log(e.message);
        }
      }
    }
    console.log('complete!');
}

exports.kickUnpaid = async(event, context) => {

    console.log('kickUnpaid');

    const network = process.env.HARDHAT_NETWORK;
    const contract = "PaymentV1";
    
    const addressesFile =
      __dirname + "/contracts/"+network+"/contract-"+contract+"-address.json";

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

    const rebill = await hre.run('kickUnpaid', {contractName: contract, contractAddress: address.Token});
    console.log('complete!');
}
