NETWORK=goerli

# make addr=123 faucet
faucet: 
	- npx hardhat --network ${NETWORK} faucet ${addr}

build:
	- cd frontend && cp src/contracts/${NETWORK}/* src/contracts/
	- cd frontend && npm run build
	- make cdk

cdk:
	- cp -R frontend/src/contracts/* frontend_api/contracts/*
	- cd deploy && AWS_PROFILE=citio_profile cdk deploy -c accountId=892044541204 -c domain=citio.digital -c subdomain=payperblock

