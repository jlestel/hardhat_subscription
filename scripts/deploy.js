// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
const { ethers, upgrades } = require("hardhat");
const path = require("path");

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
  const payment = await upgrades.deployProxy(Payment, [], /*{
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
  let transaction = await payment.createPlan(tokenbis.address, 30, 600, 0, '-1001664553005', 'BUSD', 'VIP Telegram - Abonnement 1 mois', 'Marchant de rêve', {from: address});
  console.log("Plan created");
  await transaction.wait();
  transaction = await payment.createPlan(tokenbis.address, 15, 60, 2, 'https://www.google.com', 'BUSD', 'Accès contenu Web privé - Abonnement à la minute', 'Marchant Contenus Web',  {from: address});
  await transaction.wait();
  console.log("Create plan");
  transaction = await payment.createPlan(token.address, 100, 86400, 2, 'https://randomuser.me', 'USDT', 'Accès contenu Web privé - Abonnement à la minute', 'Marchant Contenus Web',  {from: address});
  await transaction.wait();
  console.log("Create plan");
  transaction = await payment.createPlan(token.address, 100, 86400, 2, 'https://www.youtube.com', 'USDT', 'Accès MonIp', 'Marchant',  {from: address});
  await transaction.wait();
  console.log("End create plan");
  
  if (network.name === "localhost") {
    transaction = await token.transfer(first.address, 100000); 
    await transaction.wait();
    transaction = await token.connect(first).approve(payment.address, 100000);
    await transaction.wait();
    transaction = await token.transfer(second.address, 100000);
    await transaction.wait();
    transaction = await token.connect(second).approve(payment.address, 100000);
    await transaction.wait();
    transaction = await tokenbis.transfer(first.address, 50000);
    await transaction.wait();
    transaction = await tokenbis.connect(first).approve(payment.address, 50000);
    await transaction.wait();
    transaction = await tokenbis.transfer(second.address, 50000);
    await transaction.wait();
    transaction = await tokenbis.connect(second).approve(payment.address, 50000);
    await transaction.wait();
    transaction = await payment.connect(first).subscribe(0, '5275712273', {from: first.address});
    await transaction.wait();
    transaction = await payment.connect(first).subscribe(1, '', {from: first.address});
    await transaction.wait();
    transaction = await payment.connect(first).subscribe(3, '', {from: first.address});
    await transaction.wait();
  }
  //await payment.connect(second).subscribe(0, '5275712273', {from: second.address});
  //await payment.connect(second).subscribe(1, '', {from: second.address});
  //await payment.connect(deployer).subscribe(0, '5275712273', {from: first.address});
  //await payment.connect(deployer).subscribe(1, '', {from: first.address});
  //await payment.connect(first).cancel(1, {from: first.address});
  
  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(token, "Token", network.name);
  saveFrontendFiles(tokenbis, "TokenBis", network.name);
  saveFrontendFiles(payment, "PaymentV1", network.name);
  /*saveFrontendFiles(token, "Token", network.name);
  saveFrontendFiles(tokenbis, "TokenBis", network.name);
  saveFrontendFiles(payment, "PaymentV1", network.name);*/
}

function saveFrontendFiles(token, contractName, network = null) {
  const fs = require("fs"); 
  let contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");
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

  if (network === null) return;
  saveFrontendFiles(token, contractName);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
