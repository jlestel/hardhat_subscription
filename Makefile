NETWORK=goerli

# make addr=123 faucet
faucet: 
	- npx hardhat --network ${NETWORK} faucet ${addr}

build:
	- cd frontend && cp src/contracts/${NETWORK}/* src/contracts/
	- cd frontend && npm run build
	- make cdk

cdk:
	- make preparehardhatlambda
	- cd deploy && AWS_PROFILE=citio_profile cdk deploy -c accountId=892044541204 -c domain=citio.digital -c subdomain=payperblock

preparehardhatlambda:
	- cp hardhat.config.js api/
	- cp -R artifacts api/
	- cp -R cache api/
	- cp -R contracts api/
	- cp -R tasks api/
	- cd api && npm i
#	- cp -R frontend/src/contracts/* api/contracts/	