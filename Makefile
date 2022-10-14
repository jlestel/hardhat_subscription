NETWORK=goerli

# make addr=123 faucet
faucet: 
	- npx hardhat --network ${NETWORK} faucet ${addr}

#switchNetwork:
#	- cd frontend && cp src/contracts/${NETWORK}/* src/contracts/
#	- cp -Rf frontend/src/contracts/* api/contracts/

build:
#	- make switchNetwork
	- cd frontend && npm run build
	- make cdk

preparehardhatlambda:
#	- make switchNetwork
	- cp hardhat.config.js api/
	- cp -R artifacts api/
	- cp -R cache api/
#	- cp -R contracts api/
#	- cp -R tasks api/
	- cd api && npm i

cdk:
	- make preparehardhatlambda
	- cd deploy && AWS_PROFILE=citio_profile cdk deploy -c accountId=892044541204 -c domain=citio.digital -c subdomain=payperblock
