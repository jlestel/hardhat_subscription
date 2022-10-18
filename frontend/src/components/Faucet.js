import React from 'react'
import { useSelector } from 'react-redux'
import { faucets } from "./Dapp";

import {
  CButton,
} from '@coreui/react'

import { useState } from "react";

const Faucet = () => {
  const selectedAddress = useSelector((state) => state.selectedAddress)
  const selectedNetwork = useSelector((state) => state.selectedNetwork)

  const [isUsed, setIsUsed] = useState(null);
  
  return (
    <>
    {selectedNetwork && selectedNetwork.networkName && 
    (selectedNetwork.networkId == '5' || selectedNetwork.networkId == '1337')
     && (
      <div className="container">
      <div className="row justify-content-md-center">
        <div className="text-center">
          <h4>No tokens in your Wallet,</h4>

          {isUsed && ("You will receive soon test tokens...")}
          {!isUsed && (
            <>
            you can ask for a faucet now, we&apos;ll send you some tokens and ether to try !
            <br/>
            <CButton type="submit" onClick={(e) => {
              faucets(selectedAddress);
              setIsUsed(true);
            }} disabled={isUsed}>Send me some tokens please !</CButton>
            </>
          )}
        </div>
      </div>
    </div>  
    )}
    <br/>
    </>
  )
}

export default Faucet
