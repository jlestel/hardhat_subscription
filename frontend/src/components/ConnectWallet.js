import React from "react";
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { useState, useEffect } from 'react';
import {
  CButton,
} from '@coreui/react'
//import { useStore } from 'react-redux'

import { NetworkErrorMessage } from "./NetworkErrorMessage";
import { connectWallet } from "./Dapp";

export function ConnectWallet({ }) {
  const networkError = useSelector((state) => state.networkError)
  const [first, setFirst] = useState(null);
  //const store = useStore()

  const dispatch = useDispatch();

  useEffect(() => {
    //console.log('networkError', networkError, first);

    if (!first) {
      setFirst(true);
      connectWallet(dispatch);
    }
  });

  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className="col-12 text-center">
          {/* Metamask network should be set to Localhost:8545. */}
          {networkError && (
            <NetworkErrorMessage
              message={networkError}
            />
          )}
        </div>
        <div className="text-center">
          You need a to connect your wallet to start &nbsp; <CButton type="submit" onClick={() => connectWallet(dispatch)}>Connect Wallet</CButton>
        </div>
      </div>
    </div>
  );
}

export default ConnectWallet