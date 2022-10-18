import React from 'react'
import { useSelector } from 'react-redux'
import Faucet from './Faucet'
import { CSpinner, CAlert } from '@coreui/react'

const Wallet = () => {
  const tokens = useSelector((state) => state.tokens);

  return (
    <CAlert color="info">
      In your wallet:
      <ul>
      {tokens.length > 0 && (
        tokens.map(e => <li key={e.name}>{(e.balance / Math.pow(10, 18)) + ' ' + e.symbol + ' (' + e.name + ')'}</li>)
      )}
      </ul>
      {tokens.length > 0 && tokens.filter(e => e.balance > 0).length == 0 && (
      <Faucet />
      )}
    </CAlert>
  )
}

export default Wallet
