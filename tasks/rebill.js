const { BigNumber } = require("ethers");
const fs = require("fs");

// This file is only here to make interacting with the Dapp easier,
// feel free to ignore it if you don't need it.

task("rebill", "Rebill subscriptions")
  .setAction(async ({contractName, contractAddress}, { ethers }) => {
    if (network.name === "hardhat") {
      console.warn(
        "You are running the faucet task with Hardhat network, which" +
          "gets automatically created and destroyed every time. Use the Hardhat" +
          " option '--network localhost'"
      );
    }

    if ((await ethers.provider.getCode(contractAddress)) === "0x") {
      console.error("You need to deploy your contract first");
      return;
    }

    const payment = await ethers.getContractAt(contractName, contractAddress);
    //const [sender] = await ethers.getSigners();
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
            const plan = plans.filter(e => e.planId == sub[i].planId)[0];
            if (plan.planType.toString() != '3') { // no need to renew by duration plan
              console.log("Renew ...",i, sub[i].subscriber, "on plan ", sub[i].planId.toString(), parseInt(sub[i].nextPayment), parseInt(date.getTime()/1000));
              const tx = await payment.pay(sub[i].subscriptionId.toString(), { /*from: sub[i].subscriber, */gasLimit: 150000});
              const receipt = await tx.wait();
              console.log("Renewed !",i, sub[i].subscriber, "on plan ", sub[i].planId.toString(), parseInt(sub[i].nextPayment), parseInt(date.getTime()/1000));
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
  });
