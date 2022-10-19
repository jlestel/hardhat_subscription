// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

let _pollDataInterval = null;

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
    reset();
    //_stopPollingData();
    // `accountsChanged` event can be triggered with an undefined newAddress.
    // This happens when the user removes the Dapp from the "Connected
    // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
    // To avoid errors, we reset the dapp state 
    //if (newAddress === undefined) {
      //  _reset();
      //  return
      //}
    if (newAddress !== undefined) _initialize(newAddress);
  });
  
  // We reset the dapp state if the network is changed
  window.ethereum.on("chainChanged", ([networkId]) => {
    //_stopPollingData();
    //_reset();
    reset();
  });
}

const _reset = async() => {
  global.dispatch({type: 'set', selectedAddress: undefined})
  global.dispatch({type: 'set', plans: []})
  global.dispatch({type: 'set', allPlans: []})
  global.dispatch({type: 'set', subscriptions: []})
  global.dispatch({type: 'set', allSubscriptions: []})
  global.dispatch({type: 'set', tokens: []})
}

const _initialize = async(userAddress) => {
  // This method initializes the dapp
  if (global.isInilizing) return;
  global.isInilizing = true;
  // We first store the user's address in the component's state
  global.dispatch({ type: 'set', selectedAddress: userAddress})

  // Then, we initialize ethers, fetch the token's data, and start polling
  // for the user's balance.

  // Fetching the token data and the user's balance are specific to this
  // sample project, but you can reuse the same initialization pattern.
  await _initializeEthers();
  await _startPollingData(userAddress);
  global.isInilizing = false;

  // Get balance and allowance for all tokens
  //await updateBalance(userAddress);
  
}

const _initializeEthers = async() => {
  // We first initialize ethers by creating a provider using window.ethereum
  global._provider = new ethers.providers.Web3Provider(window.ethereum);

  //console.log('window.ethereum.networkVersion.toString()', window.ethereum.networkVersion.toString());
  const abi = global.tokens.contract.abi;
  //console.log(global.tokens[window.ethereum.networkVersion.toString()].contract.address);
  
  global.payment = new ethers.Contract(
    global.tokens.contract.address,
    abi,
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
    global.tokens.tokens[0].abi,
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
  //console.log('_startPollingData', address);
  //console.log('_startPollingData', _pollDataInterval);
  if (_pollDataInterval) clearInterval(_pollDataInterval);
  _pollDataInterval = setInterval(updateBalance, 10000, address);
  
  // We run it once immediately so we don't have to wait for it
  await updateBalance(address);
  await _updateSubscriptions();
  await _updatePlans();
  await _updateWithdrawal();
}

const _stopPollingData = async() => {
  //console.log('_stopPollingData', _pollDataInterval);
  clearInterval(_pollDataInterval);
  _pollDataInterval = undefined;
}

const updateBalance = async(address) => {
  try {
    let res = [];
    console.log('update balance', address);
    for (var i = 0; i < global.tokens.tokens.length; i++) {
      const token = await _getTokenData(global.tokens.tokens[i].address);
      const balance = await token.balanceOf(address);
      const decimals = global.tokens.tokens[i].decimals;
      res.push({address: token.address, name: await token.name(), symbol: await token.symbol(), balance: balance.toString(), decimals: decimals});
    }
    global.dispatch({ type: 'set',  tokens: res });
  } catch (e) {console.log(e)}
}

const getAddresses = async() => {
  try {
    const response = await fetch(process.env.REACT_APP_API_DOMAIN + '/contractppb/getContracts', {
      method: 'POST',
      body: JSON.stringify({
        network: window.ethereum.networkVersion.toString(),
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  } catch (e) {
    console.log(e);
    //global.dispatch({ type: 'set',  isValidPlan: {error: e.message} });
  }
}

const faucets = async(receiver) => {
  try {
    const response = await fetch(process.env.REACT_APP_API_DOMAIN + '/contractppb/faucets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiver: receiver
      }),
    });
    console.log(response.code);
    console.log('response',response);
  } catch (e) {
    //global.dispatch({ type: 'set',  isValidPlan: {error: e.message} });
  }
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
        subscriptionId: receipt ? receipt.events[2].args['subscription']['subscriptionId'].toString() : subscription.subscriptionId.toString(),
        planId: receipt ? receipt.events[2].args['subscription']['planId'].toString() : subscription.planId.toString(),
        token: receipt ? receipt.events[2].args['plan']['token'].toString() : plan.token.toString(),
        planType: receipt ? parseInt(receipt.events[2].args['plan']['planType']) : plan.planType,
        amount: receipt ? receipt.events[2].args['plan']['amount'].toString() : plan.amount.toString(),
        frequency: receipt ? receipt.events[2].args['plan']['frequency'].toString() : plan.frequency.toString(),
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
    await updateBalance(tx.address);
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

const release = async(tokenAddress) => {
  try {
    // If a transaction fails, we save that error in the component's state.
    // We only save one such error, so before sending a second transaction, we
    // clear it.
    _dismissTransactionError();

    // We send the transaction, and save its hash in the Dapp's state. This
    // way we can indicate that we are waiting for it to be mined.
    if (tokenAddress === '') {
      return;
    }

    const tx = await global.payment.withdrawal(tokenAddress);
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
    await updateBalance(tx.address);
    await _updatePlans();
    await _updateWithdrawal();
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

const _updateWithdrawal = async() => {
  const plans = await global.payment.getPlans(true);
  const subscriptions = await global.payment.getSubscriptions(false);
  let paid = global.tokens.tokens.map(e => {
    return {address: e.address,symbol: e.symbol, name: e.name, paid: 0, released: 0}
  });
  if (plans.length > 0 && subscriptions.length > 0) {
    for(var i=0; i<plans.length; i++) {
      const t = global.tokens.tokens.filter(t => t.address == plans[i].token.toString())[0];
      paid[global.tokens.tokens.indexOf(t)].paid += plans[i].paid / Math.pow(10, t.decimals);
      paid[global.tokens.tokens.indexOf(t)].released += plans[i].released / Math.pow(10, t.decimals);
    }
  }
  global.dispatch({ type: 'set',  withdrawal: paid.filter(e => e.paid > e.released) });
}

const _updateSubscriptions = async() => {
  let subscriptions = [];
  let allSubscriptions = [];
  try {
    subscriptions = await global.payment.getSubscriptions(true);
  } catch (e) {
    console.log(e)
  }
  // TODO: pas besoin de faire les 2 tout le temps plz 
  try {
    allSubscriptions = await global.payment.getSubscriptions(false);
  } catch (e) {
    console.log(e)
  }
  global.dispatch({ type: 'set',  subscriptions: subscriptions });
  global.dispatch({ type: 'set',  allSubscriptions: allSubscriptions });
}

const createPlan = async(plan) => {
  try {
    _dismissTransactionError();
    const tx = await global.payment.createPlan(
      plan.address, 
      plan.amount, 
      plan.frequency, 
      plan.planType, 
      plan.planTypeInfos, 
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
    const tx = await token.increaseAllowance(global.payment.address, amount.toString());
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
    await updateBalance(tx.address);
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

const subscribe = async(planId, userId = '') => {
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
    const tx = await global.payment.subscribe(planId, userId);
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
    await updateBalance(tx.address);
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
  _stopPollingData();
  _reset();
  //web3ModalRef.current.clearCachedProvider();
  window.localStorage.clear();
}

// This method checks if Metamask selected network is Localhost:8545 
const _checkNetwork = async() => {
  global.tokens = await getAddresses();
  //const tokens = JSON.parse(process.env.REACT_APP_ALLOWED_TOKENS);
  //console.log('tokens', tokens);
  //console.log('selected network',tokens[window.ethereum.networkVersion.toString()]);
  //console.log('selected network',(tokens[window.ethereum.networkVersion.toString()] !== undefined));
  //global.dispatch({ type: 'set', tokens: global.tokens})
  global.dispatch({ type: 'set', selectedNetwork: global.tokens})

  if (global.tokens !== undefined) {
    return true;
  }
  //console.log('invalid network ', window.ethereum.networkVersion)
  global.dispatch({ type: 'set',  networkError: 'Your Metamask network is not supported. You can use "Mumbai or Goerli Testnet" network in Metamask to try Payperblock. (Click on show/hide test networks in Metamask. To add Mumbai, click on "Add network" and fill: Network name: Mumbai Testnet - RPC URL: https://rpc-mumbai.maticvigil.com/ - Chain ID: 80001 - Currency Symbol: MATIC - Block explorer: https://polygonscan.com/'});
  return false;
}

export {
  connectWallet,
  createPlan,
  cancel,
  release,
  faucets,
  validPlan,
  validSubscription,
  approve,
  subscribe,
  updatePayable,
  updateAllowance,
  updateBalance,
  reset,
  _getTokenData,
  _dismissTransactionError,
  _dismissNetworkError,
  _getRpcErrorMessage,
  _checkNetwork,
}
