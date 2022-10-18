// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
const { ethers, upgrades } = require("hardhat");
const path = require("path");
const bn = require("big-integer");

async function main() {

  await hre.run('compile');
  console.log('Deploying to network', network.name, network.config.url);

  // This is just a convenience check
  if (network.name === "localhost") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer, first, second] = await ethers.getSigners();
  const address = await deployer.getAddress();
  console.log(
    "Deploying the contracts with the account:",
    address
  );
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Payment = await hre.ethers.getContractFactory("PaymentV1");
  const payment = await upgrades.deployProxy(Payment, [], { kind: 'uups' }/*{
    deployer,
    kind: "uups",
  }*/);
  await payment.deployed();
  console.log((await payment.getContractVersion()).toString());
  console.log("Payment Proxy address : ", payment.address);
  console.log("GetImplementationAddress", await upgrades.erc1967.getImplementationAddress(payment.address))
  console.log("GetAdminAddress", await upgrades.erc1967.getAdminAddress(payment.address))
  
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.deployed();
  console.log("Token address:", token.address);
  const TokenBis = await ethers.getContractFactory("TokenBis");
  const tokenbis = await TokenBis.deploy();
  await tokenbis.deployed();
  console.log("TokenBis address:", tokenbis.address);
  
  token.attach(payment.address);
  tokenbis.attach(payment.address);
  
  console.log("Create plan");
  let transaction = await payment.connect(first).createPlan(tokenbis.address, bn(300 * Math.pow(10, 18)).toString(), 600, 0, '-1001664553005', 'VIP Telegram - Abonnement 1 mois', 'Marchant de rêve', {from: first.address});
  console.log("Plan created");
  await transaction.wait();
  transaction = await payment.connect(first).createPlan(tokenbis.address, bn(15 * Math.pow(10, 18)).toString(), 600, 2, 'https://www.google.com', 'Accès contenu Web privé - Abonnement toute les 10 minutes', 'Marchant Contenus Web',  {from: first.address});
  await transaction.wait();
  console.log("Create plan");
  transaction = await payment.connect(first).createPlan(token.address, bn(100 * Math.pow(10, 18)).toString(), 60, 3, 'https://randomuser.me', 'Accès contenu Web privé - By duration à la minute', 'Marchant Contenus Web',  {from: first.address});
  await transaction.wait();
  transaction = await token.connect(deployer).approve(payment.address, bn(1000000 * Math.pow(10, 18)).toString());
  console.log("End approve");
  await transaction.wait();
  transaction = await tokenbis.connect(deployer).approve(payment.address, bn(1000000 * Math.pow(10, 18)).toString());
  console.log("End approve");
  await transaction.wait();
    transaction = await token.connect(first).approve(payment.address, bn(1000000 * Math.pow(10, 18)).toString());
  console.log("End approve");
  await transaction.wait();
  transaction = await tokenbis.connect(first).approve(payment.address, bn(1000000 * Math.pow(10, 18)).toString());
  console.log("End approve");
  await transaction.wait();
  
  //if (network.name === "localhost") {
    console.log("Create plan duration 15 seconds");
    transaction = await payment.createPlan(token.address, bn(15 * Math.pow(10, 18)).toString(), 15, 3, 'https://www.google.com', 'google - By duration', 'Marchant',  {from: address});
    await transaction.wait();
    console.log("End create plan");
    transaction = await token.transfer(first.address, bn(100000 * Math.pow(10, 18)).toString()); 
    console.log("End transfer");
    await transaction.wait();
    transaction = await token.connect(first).approve(payment.address, bn(100000 * Math.pow(10, 18)).toString());
    console.log("End approve");
    await transaction.wait();
    transaction = await token.transfer(second.address, bn(100000 * Math.pow(10, 18)).toString());
    console.log("End transfer");
    await transaction.wait();
    transaction = await token.connect(second).approve(payment.address, bn(100000 * Math.pow(10, 18)).toString());
    console.log("End connect 2");
    await transaction.wait();
    transaction = await tokenbis.transfer(first.address, bn(50000 * Math.pow(10, 18)).toString());
    console.log("End transfert 2");
    await transaction.wait();
    transaction = await tokenbis.connect(first).approve(payment.address, bn(50000 * Math.pow(10, 18)).toString());
    console.log("End approve 2");
    await transaction.wait();
    transaction = await tokenbis.transfer(second.address, bn(50000 * Math.pow(10, 18)).toString());
    await transaction.wait();
    transaction = await tokenbis.connect(second).approve(payment.address, bn(50000 * Math.pow(10, 18)).toString());
    console.log("last approve");
    await transaction.wait();
    transaction = await payment.connect(first).subscribe(0, '5275712273', {from: first.address});
    console.log("subscribe");
    await transaction.wait();
    transaction = await payment.connect(first).subscribe(1, '', {from: first.address});
    await transaction.wait();
    console.log("end subscribe");
    /*transaction = await payment.connect(first).subscribe(2, '', {from: first.address});
    await transaction.wait();
    transaction = await payment.connect(first).subscribe(3, '', {from: first.address});
    await transaction.wait();*/
  //}
  //await payment.connect(second).subscribe(0, '5275712273', {from: second.address});
  //await payment.connect(second).subscribe(1, '', {from: second.address});
  //await payment.connect(deployer).subscribe(0, '5275712273', {from: first.address});
  //await payment.connect(deployer).subscribe(1, '', {from: first.address});
  //await payment.connect(first).cancel(1, {from: first.address});
  
  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(token, "Token", network.name);
  saveFrontendFiles(tokenbis, "TokenBis", network.name);
  saveFrontendFiles(payment, "PaymentV1", network.name);
  console.log("end save");
  /*saveFrontendFiles(token, "Token", network.name);
  saveFrontendFiles(tokenbis, "TokenBis", network.name);
  saveFrontendFiles(payment, "PaymentV1", network.name);*/
}

function saveFrontendFiles(token, contractName, network = null) {
  const fs = require("fs"); 
  let contractsDir = path.join(__dirname, "..", "api", "contracts");
  if (network) {
    contractsDir = path.join(contractsDir, network)
  }

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-"+contractName+"-address.json"),
    JSON.stringify({ Token: token.address }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync(contractName);

  fs.writeFileSync(
    path.join(contractsDir, contractName+".json"),
    JSON.stringify(TokenArtifact, null, 2)
  );

  //if (network === null) return;
  //saveFrontendFiles(token, contractName);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
