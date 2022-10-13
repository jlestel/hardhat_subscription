NETWORK=goerli

# make addr=123 faucet
faucet: 
	- npx hardhat --network ${NETWORK} faucet ${addr}

build:
	- cd frontend && cp src/contracts/${NETWORK}/* src/contracts/
	- cd frontend && npm run build
	- make cdk

cdk:
	- cp -R frontend/src/contracts/* frontend_api/contracts/
	- make preparehardhatlambda
	- cd deploy && AWS_PROFILE=citio_profile cdk deploy -c accountId=892044541204 -c domain=citio.digital -c subdomain=payperblock

preparehardhatlambda:
	- cp hardhat.config.min.js schedule/hardhat.config.js
	- cp -R artifacts ./schedule/
	- cp -R cache ./schedule/
	- cp -R contracts schedule/
	- cp -R tasks schedule/	
	- mkdir -p contracts_generated
	- cp -R frontend/src/contracts/ ./schedule/contracts_generated/
	- cd schedule && npm i