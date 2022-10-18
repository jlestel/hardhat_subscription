const { BigNumber } = require("ethers");
const fs = require("fs");

// This file is only here to make interacting with the Dapp easier,
// feel free to ignore it if you don't need it.

task("faucet", "Sends ETH and tokens to an address")
  .addPositionalParam("receiver", "The address that will receive them")
  .setAction(async ({ contractName, contractAddress, receiver }, { ethers }) => {
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

    const token = await ethers.getContractAt(contractName, contractAddress);
    const [sender] = await ethers.getSigners();

    const tx = await token.transfer(receiver, BigNumber.from("1000000000000000000000"));
    await tx.wait();

    const tx2 = await sender.sendTransaction({
      to: receiver,
      value: BigNumber.from("10000000000000000"), // 0,01 ETH
    });
    await tx2.wait();

    console.log(`Transferred 0.01 ETH and 10000 tokens to ${receiver}`);
  });
