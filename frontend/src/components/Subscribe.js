import React from "react";
import { useState, useEffect } from "react";
import Moment from 'moment';
import { useSelector } from "react-redux";
import { subscribe, approve, updatePayable, updateAllowance, updateBalance } from "./Dapp";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import {
  CAlert,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CButton,
} from '@coreui/react'
import SubscriptionResult from "./SubscriptionResult";

const Subscribe = ({ miniMode }) => {
//export const Subscribe = ({ miniMode }) => {
  const selectedAddress = useSelector((state) => state.selectedAddress)
  const plans = useSelector((state) => state.allPlans)
  const balance = useSelector((state) => state.balance)
  const allowance = useSelector((state) => state.allowance)
  const isPayable = useSelector((state) => state.isPayable)
  const token = useSelector((state) => state.tokenData)

  const [planId, setPlanId] = useState(null);
  const { id } = useParams();
  const [occurences, setOccurences] = useState(null);

  function handleSubscribe(event) {
    event.preventDefault();
    subscribe(planId);
  }
  
  function handleApprove(event) {
    event.preventDefault();
    approve(plans[planId].token.toString(), planId, plans[planId].amount.toString() * occurences);
  }

  const updateHandler = async(e) => {
    await updateBalance(plans[e.target.value].token.toString(), selectedAddress)
    await updatePayable(e.target.value)
    await updateAllowance(e.target.value);
    setPlanId(e.target.value)
  }

  const mapPlans = (x) => {
    const temp = x.frequency < 3600 ? "minutes" : x.frequency <= 86400 ? "hours" : "days"
    return {
      id: x.planId.toString(), 
      type: x.planType === 0 ? 'Telegram Access' : x.planType === 1 ? 'Discord Access' : 'Web Content',
      plan: x.planName.toString(),
      amount: x.amount.toString() + ' ' /*+ x.tokenName.toString() */+ ' each ' + Moment.duration(x.frequency*1000).as(temp) + ' ' + temp,
      merchant: x.merchantName.toString(),
    }
  }
  const mapPlansToSelect = (x) => {
    const value = mapPlans(x)
    return <option value={value.id} key={value.id}>{value.merchant + ' - ' + value.type + ' - ' + value.plan + ' - ' + value.amount}</option>
  }

  useEffect(() => {
    if (!occurences || parseInt(occurences) <= 0) {
      setOccurences(12)
      //if (isNaN(document.getElementById('selectOccurence').value) || document.getElementById('selectOccurence').value <= 0) {
        document.getElementById('selectOccurence') && (document.getElementById('selectOccurence').value = '12');
      //}
    }
    if (miniMode && !planId && plans.length > 0) {
      updateBalance(plans[id].token.toString(), selectedAddress)
      updatePayable(id)
      updateAllowance(id);
      setPlanId(id);
    }
  });

  return (
    <>
    {miniMode && (
      <p>
        {!isPayable && (
          <>
          <CButton color="primary" onClick={handleApprove} 
            disabled={!balance || (balance && balance.toString() === '0') || !planId}>Approve</CButton>
          </>
        )}
        {balance.toString() !== '0' && allowance && allowance.toString() === '0' && (
          <CAlert color="info" dismissible>
          Click on &quot;Approve&quot; to authorize needed amount to renew during next {occurences} periods.
        </CAlert>
        )}
        {(isPayable) && (
          <>
          <CButton color="primary" onClick={handleSubscribe} disabled={!isPayable || !planId}>Subscribe now</CButton>
          <SubscriptionResult />
          <TransactionErrorMessage />
          <WaitingForTransactionMessage />
          </>
        )}
        {allowance > 0 && !isPayable && (
          <CAlert color="warning" dismissible>
          Not enough allowance to pay this subscription: only {allowance} allowed.
        </CAlert>
        )}
      </p>
    )}
    {!miniMode && (
      <div>
      {plans && (
      <h4>You can subscribe to {plans.length} plans:</h4>
      )}
      <CForm>
        <div className="mb-3">
          <CFormSelect id="selectPlan" size="lg" className="mb-3" aria-label="Large select example"
          onChange={updateHandler}>
          <option value="">Choose a plan to subscribe</option>
          {plans.map(mapPlansToSelect)}
          </CFormSelect> 
        </div>
        <div className="mb-3 col-md-4">
          <CFormLabel htmlFor="selectPlan">Select provisionned duration: </CFormLabel>
          <CFormInput type="number" id="selectOccurence" placeholder="eg for 1 year: 12" onChange={(e) => {
            setOccurences(parseInt(e.target.value));
          }} disabled={!planId} value={occurences}/>
          <CButton color="primary" onClick={handleApprove} 
            disabled={!balance || (balance && balance.toString() === '0') || !planId}>Approve amount of {planId && (plans[planId].amount.toString())} {token && (token.symbol)} during next {occurences} periods</CButton>
        </div>
        <TransactionErrorMessage />
        <WaitingForTransactionMessage />
        {planId && balance.toString() === '0' && (
        <CAlert color="warning" dismissible>
          You needed {token && (<>{token.name} ({token.symbol})</>)} in your wallet.
        </CAlert>
        )}
        {balance.toString() !== '0' && allowance && allowance.toString() === '0' && (
          <CAlert color="info" dismissible>
          Click on &quot;Approve&quot; to authorize needed amount to renew during next {occurences} periods.
        </CAlert>
        )}
        {(isPayable) && (
        <CAlert color="success" dismissible>
        Click on &quot;Subscribe now&quot; to start your plan ! Your allowance is {allowance} {token.symbol}.
        </CAlert>
        )}
        {allowance > 0 && !isPayable && (
          <CAlert color="warning" dismissible>
          Not enough allowance to pay this subscription: only {allowance} allowed.
        </CAlert>
        )}
        <div className="mb-3">
          <CButton color="primary" onClick={handleSubscribe} disabled={!isPayable || !planId}>Subscribe now</CButton>
        </div>
        { planId && balance && balance > 0 && (
          <CAlert color="info">
            Your wallet contains {balance} {token && (token.symbol)}
          </CAlert>
        )}

      </CForm>
    </div>
    )}
    </>
  );
}

Subscribe.propTypes = {
  miniMode: PropTypes.bool,
}

export default Subscribe