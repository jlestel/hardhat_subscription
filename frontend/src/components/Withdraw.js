import React from "react";
import { useState } from "react";
import { useSelector } from 'react-redux'

import { release } from "./Dapp";

import {
  CButton,
} from '@coreui/react'
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
 
export function Withdraw(/*{ subscriptions, cancel, access }*/) {

  //const plans = useSelector((state) => state.plans)
  //const subscriptions = useSelector((state) => state.allSubscriptions)
  const tokens = useSelector((state) => state.tokens)
  const withdrawal = useSelector((state) => state.withdrawal)

//  const [withdrawal, setWithdrawal] = useState([])

  const handleWithdrawal = (e) => {
    console.log('token', e.target.value);
    release(e.target.value);
  }
  
  return (
    <p>
      {withdrawal && withdrawal.filter(e => e.paid > 0).length === 0 && (
        <h4>No withdrawal available yet.</h4>
      )}
      {withdrawal && withdrawal.filter(e => e.paid > 0).length > 0 && (
        <>
        <h4>{withdrawal.filter(e => e.paid > 0).length} withdrawal(s) available</h4>
        {withdrawal.filter(e => e.paid > 0).map(e => 
           <p key={e.symbol}>{e.paid - e.released} {e.symbol} to withdraw: <CButton disabled={e.released==e.paid} key={e.address} onClick={handleWithdrawal} value={e.address}>Withdrawn {e.paid-e.released} {e.name} now</CButton></p>
        )}
        <TransactionErrorMessage />
        <WaitingForTransactionMessage />
        </>
      )}
    </p>
  );
}
