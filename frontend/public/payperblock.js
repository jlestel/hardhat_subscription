/*!
 * Payperblock JavaScript Library v0.2.6
 * https://payperblock.xyz/
 */
'use strict'

var _web3;

ethereum.autoRefreshOnNetworkChange = false;

if (!apiEndpoint) {
	var apiEndpoint = 'http://localhost:3001/contractppb';
}

function Payperblock(apiKey) {

	if (typeof web3 !== 'undefined') {
		_web3 = AlchemyWeb3.createAlchemyWeb3("https://polygon-mumbai.g.alchemy.com/v2/O5QqGlDXFYuko1squ-_1tsuxINrqtUa9"); //new Web3(web3.currentProvider);
	} else {
		throw "web3 is not defined";
	}

	var payperblock = {
		apiKey: false,
		testMode: false,
		contractAddress: false,
		contractAddresses: false,
		network: "auto",
		networkId: 0,
		setApiKey: function (apiKey) {

			payperblock.apiKey = apiKey;

			if (payperblock.apiKey.indexOf("test_public") != -1) {
				payperblock.testMode = true;
			} else if (payperblock.apiKey.indexOf("api_public") != -1) {
				payperblock.testMode = false;
			} else {
				throw "invalid public api key";
			}
		},
		getContractAddresses: async function () {
			if (payperblock.contractAddress) {
				return resolve(payperblock.contractAddress);
			}

			if (!_web3) {
				reject("MetaMask is not installed. Download it at https://metamask.io/");
			}

			const response = await fetch(apiEndpoint + '/getContracts');
			response.ok;     // => false
			response.status; // => 404
			payperblock.contractAddresses = await response.json();
			const netId = await payperblock.getMetaMaskNetwork();
			var networkName;

			switch (netId.toString()) {
				case "1":
					//throw "mainnet is currently not available";

					if (payperblock.network == 'mainnet' || payperblock.network == 'auto') {

						if (!payperblock.contractAddresses.mainnet.smartContractAddress) {
							throw "mainnet is not avaiable";
						}

						networkName = "Mainnet";
						payperblock.contractAddress = payperblock.contractAddresses.mainnet.smartContractAddress;
						payperblock.ABI = {
							"abi": JSON.parse(payperblock.contractAddresses.mainnet.abi)
						}
					} else {
						throw "your wallets network (mainnet) does not match the selected network for the transaction (" + payperblock.network + ")";
					}
					break;
				case "5":
				case "1337":
				case "80001":

					if (
						payperblock.network == 'goerli' || payperblock.network == 'auto' ||
						payperblock.network == 'localhost' || payperblock.network == 'mumbai'
						) {
						networkName = payperblock.contractAddresses[netId.toString()].name;
						payperblock.contractAddress = payperblock.contractAddresses[netId.toString()].smartContractAddress;
						payperblock.ABI = {
							"abi": payperblock.contractAddresses[netId.toString()].abi
						}
					} else {
						throw "your wallets network (ropsten) does not match the selected network for the transaction (" + payperblock.network + ")";
					}
					break;
				default:
					throw "Uknown testnet. Try ropsten testnet.";
					networkName = "Unknown";
			}
			return payperblock.contractAddress;
		},
		getMetaMaskPermission: async function () {

			if (typeof ethereum !== 'undefined') {

				await ethereum.enable();
			} else {
				return true;
			}
		},
		approveMethod: async function (plan) {
			var instance = new _web3.eth.Contract(plan.currencyAbi, plan.currencyAddress);
			const tx = await instance.methods.increaseAllowance(payperblock.contractAddress, plan.amount.toString()).send({from: '0x17428676fB2b1EFF2AC8cb298A693C2FBa78BcE5'});
			//await tx.wait();
			return plan
		},
		subscribeMethod: async function (plan) {
			var instance = new _web3.eth.Contract(payperblock.ABI.abi, payperblock.contractAddress);
			const tx = await instance.methods.subscribe(plan.id, '').send({from: '0x17428676fB2b1EFF2AC8cb298A693C2FBa78BcE5'});
			return plan
		},
		getSubscriptionPlan: function (id) {

			var url = apiEndpoint + '/plan/' + id;

			return payperblock.getRequest(url)
				.then(function (o) {
					return JSON.parse(o);
				});
		},
		subscribe: async function (data) {
			/*var senderWallet;
			var receiverWallet;
			var subscriptionPlan;
			var subscriptionAmount;
			var customPrice;
			var priceLimitPercentage = 1.50;
			var transferOut = false;
			var subscriptionFeeAmount;*/

			if (data.network) {
				payperblock.network = data.network;
			}
			//payperblock.networkId = await _web3.eth.net.getId();
			await payperblock.getContractAddresses();
			await payperblock.getMetaMaskPermission();
			await payperblock.metaMaskLoaded();
			await payperblock.metaMaskLocked();
			const account = await payperblock.getMetaMaskAccount();	
			//senderWallet = account;
			const plan = await payperblock.getSubscriptionPlan(data.subscriptionPlan);
			await payperblock.approveMethod(plan);
			await payperblock.subscribeMethod(plan);
			//subscriptionPlan = plan;

			//const tx = await payperblock.createSubscription(customer);
/*
			if (!subscriptionPlan.wallet && !data.receiverWallet) {

				// cant continue without a wallet to subscribe to
				throw "Subscription plan has no wallet assigned to it, therefore param 'receiverWallet' is required when calling payperblock.subscribe()";

			} else if (!subscriptionPlan.wallet) {

				// subscription plan has no receiver wallet, overwrite it with the one from payperblock.subscribe()
				receiverWallet = data.receiverWallet;

			} else {

				receiverWallet = subscriptionPlan.wallet;
			}

			if (!_web3.utils.isAddress(receiverWallet)) {

				throw "receiverAddress is not a valid address";
			}

			if (subscriptionPlan.daysInterval == -1 && !data.interval) {
				throw "Subscription plan has interval set to custom, therefore param 'interval' is required when calling payperblock.subscribe()";
			}

			if (subscriptionPlan.daysInterval == -1 && !payperblock.isInt(data.interval)) {
				throw "interval must be an integer";
			}

			// todo: only for CRYPTO plans?
			if (subscriptionPlan.daysInterval == -1 && data.interval && data.interval >= 1 && data.interval <= 365) {

				subscriptionPlan.daysInterval = parseInt(data.interval);

			} else if (subscriptionPlan.daysInterval == -1 && data.interval) {

				throw "interval must be between 1 and 365";
			}

			if (typeof data.transferOut !== 'undefined' && typeof data.transferOut !== "boolean") {
				throw "transferOut is must be a boolean"
			}

			if (data.transferOut && subscriptionPlan.transferOut == 1) {

				transferOut = true;

			} else {

				transferOut = false;
			}

			//if (subscriptionPlan.acceptedCryptoCurrencies.Ethereum.price > 0) {
			if (subscriptionPlan.amount > 0) {

				return subscriptionPlan.amount;

			} else {

				if (data.amount) {

					if (!payperblock.isInt(data.amount) && !payperblock.isFloat(data.amount)) {
						throw "amount must be an integer or a float";
					}

					customPrice = data.amount;

					if (subscriptionPlan.currencyCode == 'ETH') {

						if (data.amount < 0.01) {
							throw "the minimum amount is 0.01 ETH";
						}
					} else {

						if (customPrice < 1) {
							throw "the minimum amount is " + subscriptionPlan.currencyCode + " 1.00 ";
						}

						/*return payperblock.getExchangePrice(subscriptionPlan.currencyCode, 'ETH', customPrice)
							.then((price) => {
								return price;
							});
						*/
			/*		}
				}
			}
		
			subscriptionAmount = amount;
			subscriptionFeeAmount = amount / 100 * subscriptionPlan.fee;
			subscriptionFeeAmount = subscriptionFeeAmount * 1000000000000000000 / 1000000000000000000;

			if (_web3.utils.isAddress(subscriptionPlan.wallet)) {

				var subscriptionTotalAmount = parseFloat(subscriptionAmount);

			} else {

				var subscriptionTotalAmount = parseFloat(subscriptionAmount) + parseFloat(subscriptionFeeAmount);
			}

				var subscriptionPriceLimit = subscriptionTotalAmount * (1 + (subscriptionPlan.priceLimitPercentage / 100));
				return payperblock.getMetaMaskAccount()
					.then((metamaskAddress) => {
						return new Promise(function (resolve, reject) {

							//const account = await window.ethereum.request({ method: 'eth_requestAccounts' })
							//const signer = provider.getSigner();			

							var instance = new _web3.eth.Contract(payperblock.ABI.abi, payperblock.contractAddress, metamaskAddress);
							const tx = instance.methods.subscribe(subscriptionPlan.id, '').call().then((res)=>
							{
								return resolve(res);
							});*/
							//return tx;
							/*.then((e, res)=>
								{
									if (e) { return reject(e); }
									return resolve(res);
								});
								/*receiverWallet,
								subscriptionPlan.daysInterval,
								_web3.toWei(subscriptionPriceLimit),
								transferOut,
								_web3.toWei(subscriptionFeeAmount),
								{
									value: _web3.toWei(subscriptionTotalAmount),
									gas: 500000,
									gasPrice: 1000000000,
									from: senderWallet
								}*/
						/*});
					});
				})
				.then((txHash) => {
					console.log(txHash);*/
					/*var customer = {
						subscriptionPlanId: subscriptionPlan.id,
						senderWallet: senderWallet,
						receiverWallet: receiverWallet,
						customerId: data.customerId,
						customerEmail: data.customerEmail,
						customerDescription: data.customerDescription,
						transactionHash: txHash,
						subscriptionCurrency: "ETH",
						subscriptionPrice: subscriptionAmount,
						customPrice: customPrice,
						interval: data.interval,
						transferOut: transferOut,
						smartContractAddress: payperblock.contractAddress,
					};

					return payperblock.createSubscription(customer)
						.then(() => {
							return txHash;
						});*/
				//});
		},
		/*createSubscription: function (data) {

			var url = apiEndpoint + '/subscription';

			return payperblock.postRequest(url, data)
				.then(function (o) {
					return JSON.parse(o);
				});
		},*/
		/*getExchangePrice: function (from, to, amount) {

			var url = apiEndpoint + '/price/' + from + '/' + to + '/' + amount;

			return payperblock.getRequest(url);
		},*/
		getRequest: function (url) {

			if (!payperblock.apiKey) {
				throw "payperblock api key not set";
			}

			return new Promise(function (resolve, reject) {

				var http = new XMLHttpRequest();

				http.open('GET', url, true);
				http.setRequestHeader('Authorization', 'Bearer ' + payperblock.apiKey);

				http.onreadystatechange = function () {
					if (http.readyState == 4 && http.status == 200) {
						return resolve(http.responseText);
					} else if (http.readyState == 4 && http.status != 200) {
						reject(http.responseText);
					}
				}

				http.send();
			});
		},
		postRequest: function (url, params) {

			if (!payperblock.apiKey) {
				throw "payperblock api key not set";
			}

			return new Promise(function (resolve, reject) {

				var http = new XMLHttpRequest();

				http.open('POST', url, true);
				http.setRequestHeader('Authorization', 'Bearer ' + payperblock.apiKey);

				http.onreadystatechange = function () {

					if (http.readyState == 4 && http.status == 200) {
						resolve(http.responseText);
					} else if (http.readyState == 4 && http.status != 200) {
						reject(http.responseText);
					}
				}

				http.send(JSON.stringify(params));
			});
		},
		getMetaMaskNetwork: function () {
			return new Promise(function (resolve, reject) {
				return _web3.eth.net.getId((err, netId) => {
					return resolve(netId);
				});
			});
		},
		metaMaskLoaded: function () {
			return new Promise(function (resolve, reject) {

				if (_web3 == 'undefined') {
					reject("MetaMask is missing. Please download the MetaMask browser extension.");
				}
				return resolve(true);
			});
		},
		metaMaskLocked: function () {
			return new Promise(function (resolve, reject) {

				if (_web3.eth.accounts.length == 0) {
					reject("MetaMask is locked. Please login to your MetaMask account.");
				}
				return resolve(true);
			});
		},
		getMetaMaskAccount: function () {
			return new Promise(function (resolve, reject) {

				return payperblock.getMetaMaskPermission()
					.then(() => {
						return _web3.eth.getAccounts(function (e, o) {
							if (e) {
								return reject(e);
							} else {
								return resolve(o[0]);
							}
						});
					});
			});
		},
		getSubscriptionFunds: function () {
			return payperblock.getContractAddresses()
				.then(() => {
					return payperblock.getMetaMaskAccount();
				})
				.then((address) => {

					if (!address) {
						throw "Error retrieving your metamask wallet address. Make sure metamask is unlocked";
					}

					return new Promise(function (resolve, reject) {

						var instance = _web3.eth.contract(payperblock.ABI.abi).at(payperblock.contractAddress);

						return instance.getBalances(address, function (e, res) {
							if (e) { return reject(e); }
							var value = _web3.fromWei(res, 'ether');
							value = _web3.toDecimal(value);
							return resolve(value);
						});
					});
				});
		},
		getSubscriptions: function (address) {

			return new Promise(function (resolve, reject) {

				if (!address) {

					return payperblock.getMetaMaskAccount()
						.then((metamaskAddress) => {

							var url = apiEndpoint + '/subscriptions/' + metamaskAddress;

							return payperblock.getRequest(url, payperblock.apiKey)
								.then(function (subscriptions) {

									payperblock.subscriptions = JSON.parse(subscriptions);

									return resolve(payperblock.subscriptions);
								});
						});
				} else {

					var url = apiEndpoint + '/subscriptions/' + address;

					return payperblock.getRequest(url, payperblock.apiKey)
						.then(function (subscriptions) {

							payperblock.subscriptions = JSON.parse(subscriptions);

							return resolve(payperblock.subscriptions);
						});
				}
			});
		},
		getMetaMaskBalance: function () {

			return new Promise(function (resolve, reject) {

				return payperblock.getMetaMaskAccount()
					.then((address) => {
						return _web3.eth.getBalance(address, function (e, o) {
							if (e) return reject(e);
							var value = _web3.fromWei(o, 'ether');
							value = web3.toDecimal(value);
							return resolve(value);
						});
					});
			});
		},
		unsubscribe: function (pos, contractAddress) {

			return new Promise(function (resolve, reject) {

				var instance = _web3.eth.contract(payperblock.ABI.abi).at(contractAddress);

				return payperblock.getMetaMaskAccount()
					.then((address) => {

						return instance.deactivateSubscription(pos, { gas: 500000, from: address }, function (e, res) {
							if (e) { return reject(e); }
							return resolve(res);
						});
					});
			});
		},
		/*addFunds: function (amount) {

			return new Promise(function (resolve, reject) {

				return payperblock.getMetaMaskAccount()
					.then((address) => {
						var instance = _web3.eth.contract(payperblock.ABI.abi).at(payperblock.contractAddress);

						return instance.addFunds(address, { value: _web3.toWei(amount), gas: 500000, from: address }, function (e, res) {
							if (e) { return reject(e); }
							return resolve(res);
						});
					});
			});
		},
		withdrawFunds: function (amount) {

			return new Promise(function (resolve, reject) {

				return payperblock.getMetaMaskAccount()
					.then((address) => {
						var instance = _web3.eth.contract(payperblock.ABI.abi).at(payperblock.contractAddress);

						return instance.withdrawFunds(_web3.toWei(amount), { gas: 500000, from: address }, function (e, res) {
							if (e) { return reject(e); }
							return resolve(res);
						});
					});
			});
		},*/
		isInt: function isInt(n) {
			return Number(n) === n && n % 1 === 0;
		},
		isFloat: function isFloat(n) {
			return Number(n) === n && n % 1 !== 0;
		}
	}

	payperblock.setApiKey(apiKey);

	return payperblock;
};
