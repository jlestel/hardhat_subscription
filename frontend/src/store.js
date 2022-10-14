import { createStore } from 'redux'

const initialState = {
  sidebarShow: true,

  // The info of the token (i.e. It's Name and symbol)
  tokenData: '',
  tokens: undefined,
  // The user's address and balance
  selectedAddress: '',
  selectedNetwork: undefined,
  isValidPlan: undefined,
  balance: 0,
  plans: [],
  allPlans: [],
  subscriptions: [],
  responseToSubscribe: undefined,
  tgUser: undefined,
  isPayable: false,
  allowance: false,
  // The ID about transactions being sent, and any possible error with them
  txBeingSent: undefined,
  transactionError: undefined,
  networkError: undefined,
}

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    default:
      return state
  }
}

const store = createStore(changeState)
export default store
