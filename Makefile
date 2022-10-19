NETWORK=mumbai
#NETWORK=goerli

# make addr=123 faucet
faucet: 
	- npx hardhat --network ${NETWORK} faucet ${addr}

run:
	- npx hardhat run scripts/deploy.js --network localhost
	- cd api && HARDHAT_NETWORK=localhost NETWORKS=5,1337 npm start
	- cd frontend && BROWSER='google chrome' BROWSER_ARGS='--remote-debugging-port=9222' node node_modules/react-scripts/bin/react-scripts.js start

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
	- cd deploy && AWS_PROFILE=citio_profile cdk deploy -c accountId=892044541204 -c domain=payperblock.xyz -c subdomain=www
