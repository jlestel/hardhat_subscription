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
	- cp hardhat.config.js frontend_api/
	- cp -R artifacts frontend_api/
	- cp -R cache frontend_api/
	- cp -R contracts frontend_api/
	- cp -R tasks frontend_api/	
	- mkdir -p contracts_generated
	- cp -R frontend/src/contracts/ frontend_api/contracts_generated/
	- cd frontend_api && npm i
#	- cp -R frontend/src/contracts/* frontend_api/contracts/	