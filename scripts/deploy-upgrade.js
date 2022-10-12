const { ethers, upgrades } = require("hardhat");
//the address of the deployed proxy
//const PROXY = "0xaf03a6F46Eea7386F3E5481a4756efC678a624e6";
const path = require("path");

async function main() {
  await hre.run('compile');
  console.log('Deploying to network', network.name, network.config.url);
  const contractName = 'Payment';
  const contractVersion = 2;
  const PaymentVx = await ethers.getContractFactory(contractName + "V" + contractVersion);
  const fs = require("fs");
  let contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts", network.name);
  const conf = await fs.readFileSync(path.join(contractsDir, "contract-"+contractName+"V" + (contractVersion-1)+ "-address.json"));
  console.log("Upgrading Payment..." + contractVersion);
  //await upgrades.validateUpgrade(JSON.parse(conf.toString()).Token, PaymentVx);
  const payment = await upgrades.upgradeProxy(JSON.parse(conf.toString()).Token, PaymentVx);
  console.log("Payment upgraded to v" + contractVersion);
  //await payment.deployed();
  console.log((await payment.getContractVersion()).toString());
  //console.log((await payment.getX()).toString());
  console.log("Payment address Proxy: ", payment.address);
  
  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(payment, "PaymentV2", network.name);
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

main();