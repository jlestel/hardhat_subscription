// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import TokenArtifact from "../contracts/Sample.json";
/*import contractAddress from "../contracts/contract-Token-address.json";
import TokenBisArtifact from "../contracts/TokenBis.json";*/
//import contractBisAddress from "../contracts/contract-TokenBis-address.json";
import PaymentArtifact from "../contracts/PaymentV1.json";
import contractPaymentAddress from "../contracts/contract-PaymentV1-address.json";

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

const connectWallet = async(dispatch) => {
  if (dispatch)
    global.dispatch = dispatch
  // This method is run when the user clicks the Connect. It connects the
  // dapp to the user's wallet, and initializes it.

  // To connect to the user's wallet, we have to run this method.
  // It returns a promise that will resolve to the user's address.
  const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });

  // Once we have the address, we can initialize the application.

  // First we check the network
  const check = await _checkNetwork();
  if (!check) {
    return;
  }

  await _initialize(selectedAddress);

  // We reinitialize it whenever the user changes their account.
  window.ethereum.on("accountsChanged", ([newAddress]) => {
    console.log("accountsChanged");
    _stopPollingData();
    // `accountsChanged` event can be triggered with an undefined newAddress.
    // This happens when the user removes the Dapp from the "Connected
    // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
    // To avoid errors, we reset the dapp state 
    if (newAddress === undefined) {
      _reset();
      return
    }
    
    _initialize(newAddress);
  });
  
  // We reset the dapp state if the network is changed
  window.ethereum.on("chainChanged", ([networkId]) => {
    _stopPollingData();
    _reset();
  });
}

const _reset = async() => {
  global.dispatch({type: 'set', selectedAddress: undefined})
  global.dispatch({type: 'set', balance: 0})
  global.dispatch({type: 'set', plans: []})
  global.dispatch({type: 'set', allPlans: []})
  global.dispatch({type: 'set', subscriptions: []})
}

const _initialize = async(userAddress) => {
  // This method initializes the dapp

  // We first store the user's address in the component's state
  global.dispatch({ type: 'set', selectedAddress: userAddress})

  // Then, we initialize ethers, fetch the token's data, and start polling
  // for the user's balance.

  // Fetching the token data and the user's balance are specific to this
  // sample project, but you can reuse the same initialization pattern.
  await _initializeEthers();
  //await _getTokenData();
  await _startPollingData(userAddress);
}

const _initializeEthers = async() => {
  // We first initialize ethers by creating a provider using window.ethereum
  global._provider = new ethers.providers.Web3Provider(window.ethereum);

  // Then, we initialize the contract using that provider and the token's
  // artifact. You can do this same thing with your contracts.
  /*global.token = new ethers.Contract(
    contractAddress.Token,
    TokenArtifact.abi,
    _provider.getSigner(0)
  );*/
  
  global.payment = new ethers.Contract(
    contractPaymentAddress.Token,
    PaymentArtifact.abi,
    global._provider.getSigner(0)
  );
}

const _getTokenData = async(tokenAddress) => {
  // We first initialize ethers by creating a provider using window.ethereum
  //const _provider = new ethers.providers.Web3Provider(window.ethereum);

  // Then, we initialize the contract using that provider and the token's
  // artifact. You can do this same thing with your contracts.
  const token =  new ethers.Contract(
    tokenAddress,
    TokenArtifact.abi,
    global._provider.getSigner(0)
  );
  const name = await token.name();
  const symbol = await token.symbol();
  global.dispatch({ type: 'set',  tokenData: { name, symbol } });
  return token;
}

// The next two methods are needed to start and stop polling data. While
// the data being polled here is specific to this example, you can use this
// pattern to read any data from your contracts.
//
// Note that if you don't need it to update in near real time, you probably
// don't need to poll it. If that's the case, you can just fetch it when you
// initialize the app, as we do with the token data.
const _startPollingData = async(address) => {

  //global._pollDataInterval = setInterval(updateBalance, 10000, address);

  // We run it once immediately so we don't have to wait for it
  //await updateBalance(address);
  await _updateSubscriptions();
  await _updatePlans();
}

const _stopPollingData = () => {
  clearInterval(global._pollDataInterval);
  global._pollDataInterval = undefined;
}

// The next two methods just read from the contract and store the results
// in the component state.
/*const _getTokenData = async(address) => {
  const token = _getToken(address);
  const name = await token.name();
  const symbol = await token.symbol();

  global.dispatch({ type: 'set',  tokenData: { name, symbol } });
}*/

const updateBalance = async(tokenAddress, address) => {
  try {
    const token = await _getTokenData(tokenAddress);
    const balance = await token.balanceOf(address);
    console.log(balance.toString())
    global.dispatch({ type: 'set',  balance: balance.toString() });
  } catch (e) {console.log(e)}
}

const validPlan = async(planType, planTypeInfos) => {
  try {
    
    const response = await fetch(process.env.REACT_APP_API_DOMAIN + '/apippb/validPlan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planType: planType,
        planTypeInfos: planTypeInfos,
      }),
    });
    console.log(response.code);
    console.log('response',response);
    const body = await response.text();
    const json = JSON.parse(body);
    global.dispatch({ type: 'set',  isValidPlan: json });
  } catch (e) {
    //global.dispatch({ type: 'set',  isValidPlan: {error: e.message} });
  }
  //_updateSubscriptions();
}

const validSubscription = async(receipt, subscription, plan = null) => {
  console.log(receipt);
  console.log(subscription);
  try {
    const response = await fetch(process.env.REACT_APP_API_DOMAIN + '/apippb/validSubscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId: receipt ? receipt.events[2].args['subscription']['subscriptionId'].toString() : subscription.subscriptionId,
        planType: receipt ? parseInt(receipt.events[2].args['plan']['planType']) : plan.planType,
        frequency: receipt ? receipt.events[2].args['plan']['frequency'].toString() : plan.frequency,
        planTypeInfos: receipt ? receipt.events[2].args['plan']['planTypeInfos'].toString() : plan.planTypeInfos,
        subscriber: receipt ? receipt.events[2].args[0].toString() : subscription.subscriber,
        subscriberInfos: receipt ? receipt.events[2].args['subscription']['subscriberInfos'].toString() : subscription.subscriberInfos,
        plan: receipt ? receipt.events[2].args['plan']['planName'].toString() : plan.planName,
        playerUrl: process.env.REACT_APP_PLAYER_DOMAIN,
      }),
    });
    console.log(response.code);
    console.log('response',response);
    const body = await response.text();
    const json = JSON.parse(body);
    global.dispatch({ type: 'set',  responseToSubscribe: json });
  } catch (e) {
    global.dispatch({ type: 'set',  responseToSubscribe: {error: e.message} });
  }
  //_updateSubscriptions();
}

const updatePayable = async(planId) => {
  let payable = false
  try {
    if (planId !== '') {
      payable = await global.payment.isPayable(planId);
    }
  } catch (e) {console.log(e)}
  global.dispatch({ type: 'set',  isPayable: payable });
}


const cancel = async(subscriptionId) => {
  try {
    // If a transaction fails, we save that error in the component's state.
    // We only save one such error, so before sending a second transaction, we
    // clear it.
    _dismissTransactionError();

    // We send the transaction, and save its hash in the Dapp's state. This
    // way we can indicate that we are waiting for it to be mined.
    if (subscriptionId === '') {
      return;
    }
    const tx = await global.payment.cancel(parseInt(subscriptionId));
    global.dispatch({ type: 'set',  txBeingSent: tx.hash });

    // We use .wait() to wait for the transaction to be mined. This method
    // returns the transaction's receipt.
    const receipt = await tx.wait();

    // The receipt, contains a status flag, which is 0 to indicate an error.
    if (receipt.status === 0) {
      // We can't know the exact error that made the transaction fail when it
      // was mined, so we throw this generic one.
      throw new Error("Transaction failed");
    }

    // If we got here, the transaction was successful, so you may want to
    // update your state. Here, we update the user's balance.
    //await updateBalance(tx.address);
    await _updateSubscriptions();
  } catch (error) {
    // We check the error code to see if this error was produced because the
    // user rejected a tx. If that's the case, we do nothing.
    if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
      return;
    }

    // Other errors are logged and stored in the Dapp's state. This is used to
    // show them to the user, and for debugging.
    console.error(error);
    global.dispatch({ type: 'set',  transactionError: error });
  } finally {
    // If we leave the try/catch, we aren't sending a tx anymore, so we clear
    // this part of the state.
    global.dispatch({ type: 'set',  txBeingSent: undefined });
  }
}
  
const updateAllowance = async(planId) => {
  if (planId === '') {
    global.dispatch({ type: 'set',  allowance: '' });
    return;
  }
  let allowance = 0;
  try {
    allowance = await global.payment.allowance(planId);
  } catch (e) {console.log(e)}
  global.dispatch({ type: 'set',  allowance: allowance.toString() });
}

const _updatePlans = async() => {
  let allPlans = [];
  let plans = [];
  try {
    allPlans = await global.payment.getPlans(false);
  } catch (e) {console.log(e)}
  try {
    plans = await global.payment.getPlans(true);
  } catch (e) {console.log(e)}
  global.dispatch({ type: 'set',  allPlans: allPlans });
  global.dispatch({ type: 'set',  plans: plans });
}

const _updateSubscriptions = async() => {
  let subscriptions = [];
  try {
    subscriptions = await global.payment.getSubscriptions(true);
  } catch (e) {console.log(e)}
  global.dispatch({ type: 'set',  subscriptions: subscriptions });
}

const createPlan = async(plan) => {
  try {
    _dismissTransactionError();
    console.log(plan);
    //transaction = await payment.createPlan(token.address, 100, 86400, 2, 'https://www.youtube.com', 'USDT', 'Accès MonIp', 'Marchant',  {from: address});
    const tx = await global.payment.createPlan(
      plan.address, 
      plan.amount, 
      plan.frequency, 
      plan.planType, 
      plan.planTypeInfos, 
      plan.tokenName, 
      plan.planName, 
      plan.merchantName,
      {from: plan.subscriberAddress}
    );
    global.dispatch({ type: 'set',  txBeingSent: tx.hash });

    const receipt = await tx.wait();

    if (receipt.status === 0) {
      // We can't know the exact error that made the transaction fail when it
      // was mined, so we throw this generic one.
      throw new Error("Transaction failed");
    }

    // If we got here, the transaction was successful, so you may want to
    // update your state. Here, we update the user's balance.
    await updateBalance(plan.address, tx.address);
    await _updatePlans();
  } catch (error) {
    // We check the error code to see if this error was produced because the
    // user rejected a tx. If that's the case, we do nothing.
    if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
      return;
    }

    // Other errors are logged and stored in the Dapp's state. This is used to
    // show them to the user, and for debugging.
    console.error(error);
    global.dispatch({ type: 'set',  transactionError: error });
  } finally {
    // If we leave the try/catch, we aren't sending a tx anymore, so we clear
    // this part of the state.
    global.dispatch({ type: 'set',  txBeingSent: undefined });
  }
}

const approve = async(tokenAddress, planId, amount) => {
  // Sending a transaction is a complex operation:
  //   - The user can reject it
  //   - It can fail before reaching the ethereum network (i.e. if the user
  //     doesn't have ETH for paying for the tx's gas)
  //   - It has to be mined, so it isn't immediately confirmed.
  //     Note that some testing networks, like Hardhat Network, do mine
  //     transactions immediately, but your dapp should be prepared for
  //     other networks.
  //   - It can fail once mined.
  //
  // This method handles all of those things, so keep reading to learn how to
  // do it.

  try {
    // If a transaction fails, we save that error in the component's state.
    // We only save one such error, so before sending a second transaction, we
    // clear it.
    _dismissTransactionError();

    // We send the transaction, and save its hash in the Dapp's state. This
    // way we can indicate that we are waiting for it to be mined.
    //const allPlans = useSelector((state) => state.allPlans)
    //console.log(allPlans);
    const token = await _getTokenData(tokenAddress);
    const tx = await token.approve(global.payment.address, amount);
    global.dispatch({ type: 'set',  txBeingSent: tx.hash });

    // We use .wait() to wait for the transaction to be mined. This method
    // returns the transaction's receipt.
    const receipt = await tx.wait();

    // The receipt, contains a status flag, which is 0 to indicate an error.
    if (receipt.status === 0) {
      // We can't know the exact error that made the transaction fail when it
      // was mined, so we throw this generic one.
      throw new Error("Transaction failed");
    }

    // If we got here, the transaction was successful, so you may want to
    // update your state. Here, we update the user's balance.
    //await updateBalance(tx.address);
    await updatePayable(planId);
    await updateAllowance(planId);
  } catch (error) {
    // We check the error code to see if this error was produced because the
    // user rejected a tx. If that's the case, we do nothing.
    if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
      return;
    }

    // Other errors are logged and stored in the Dapp's state. This is used to
    // show them to the user, and for debugging.
    console.error(error);
    global.dispatch({ type: 'set',  transactionError: error });
  } finally {
    // If we leave the try/catch, we aren't sending a tx anymore, so we clear
    // this part of the state.
    global.dispatch({ type: 'set',  txBeingSent: undefined });
  }
}

const subscribe = async(planId) => {
  // Sending a transaction is a complex operation:
  //   - The user can reject it
  //   - It can fail before reaching the ethereum network (i.e. if the user
  //     doesn't have ETH for paying for the tx's gas)
  //   - It has to be mined, so it isn't immediately confirmed.
  //     Note that some testing networks, like Hardhat Network, do mine
  //     transactions immediately, but your dapp should be prepared for
  //     other networks.
  //   - It can fail once mined.
  //
  // This method handles all of those things, so keep reading to learn how to
  // do it.

  try {
    // If a transaction fails, we save that error in the component's state.
    // We only save one such error, so before sending a second transaction, we
    // clear it.
    _dismissTransactionError();

    // We send the transaction, and save its hash in the Dapp's state. This
    // way we can indicate that we are waiting for it to be mined.
    const tx = await global.payment.subscribe(planId, '5275712273');
    global.dispatch({ type: 'set',  txBeingSent: tx.hash });

    // We use .wait() to wait for the transaction to be mined. This method
    // returns the transaction's receipt.
    const receipt = await tx.wait();

    // The receipt, contains a status flag, which is 0 to indicate an error.
    if (receipt.status === 0) {
      // We can't know the exact error that made the transaction fail when it
      // was mined, so we throw this generic one.
      throw new Error("Transaction failed");
    }

    // If we got here, the transaction was successful, so you may want to
    // update your state. Here, we update the user's balance.
    //await updateBalance(tx.address);
    await validSubscription(receipt, null);
    await _updateSubscriptions();
    await updatePayable(planId);
    await updateAllowance(planId);
  } catch (error) {
    // We check the error code to see if this error was produced because the
    // user rejected a tx. If that's the case, we do nothing.
    if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
      return;
    }

    // Other errors are logged and stored in the Dapp's state. This is used to
    // show them to the user, and for debugging.
    console.error(error);
    global.dispatch({ type: 'set',  transactionError: error });
  } finally {
    // If we leave the try/catch, we aren't sending a tx anymore, so we clear
    // this part of the state.
    global.dispatch({ type: 'set',  txBeingSent: undefined });
  }
}

// This method just clears part of the state.
const _dismissTransactionError = () => {
  global.dispatch({ type: 'set',  transactionError: undefined });
}

// This method just clears part of the state.
const _dismissNetworkError = () => {
  global.dispatch({ type: 'set',  networkError: undefined });
}

// This is an utility method that turns an RPC error into a human readable
// message.
const _getRpcErrorMessage = (error) => {
  if (error.data) {
    return error.data.message;
  }

  return error.message;
}

// This method resets the state
const reset = () => {
  _stopPollingData()
  _reset()
  //web3ModalRef.current.clearCachedProvider();
  window.localStorage.clear();
}

// This method checks if Metamask selected network is Localhost:8545 
const _checkNetwork = async() => {
  const tokens = JSON.parse(process.env.REACT_APP_ALLOWED_TOKENS);
  console.log('selected network',tokens[window.ethereum.networkVersion.toString()]);
  console.log('selected network',(tokens[window.ethereum.networkVersion.toString()] !== undefined));
  global.dispatch({ type: 'set', selectedNetwork: tokens[window.ethereum.networkVersion.toString()]})

  if (tokens[window.ethereum.networkVersion.toString()] !== undefined) {
    return true;
  }
  console.log('invalid network ', window.ethereum.networkVersion)
  global.dispatch({ type: 'set',  networkError: 'Your Metamask network is not supported. You can use "Goerli Test" network in Metamask to try Payperblock.'});
  return false;
}

export {
  connectWallet,
  createPlan,
  cancel,
  validPlan,
  validSubscription,
  approve,
  subscribe,
  updatePayable,
  updateAllowance,
  updateBalance,
  reset,
  _dismissTransactionError,
  _dismissNetworkError,
  _getRpcErrorMessage,
  _checkNetwork,
}
