import React from "react";
import { useState, useEffect } from "react";
import Moment from 'moment';
import { useSelector, useDispatch } from "react-redux";
import { subscribe, approve, updatePayable, updateAllowance, updateBalance } from "./Dapp";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import {
  CAlert,
  CForm,
  CCol,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CButton,
} from '@coreui/react'
import SubscriptionResult from "./SubscriptionResult";
import Wallet from "./Wallet";
import TelegramLoginButton from 'react-telegram-login';

import bigInt  from "big-integer";


const Subscribe = ({ miniMode }) => {
//export const Subscribe = ({ miniMode }) => {
  const dispatch = useDispatch();

  const selectedAddress = useSelector((state) => state.selectedAddress)
  const plans = useSelector((state) => state.allPlans)
  const tokens = useSelector((state) => state.tokens)
  const allowance = useSelector((state) => state.allowance)
  const isPayable = useSelector((state) => state.isPayable)
  //const token = useSelector((state) => state.tokenData)
  
  const [planId, setPlanId] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const { id } = useParams();
  const [occurences, setOccurences] = useState(null);
  const [login, setLogin] = useState(null);
  const [period, setPeriod] = useState(null);
  const bn = bigInt;

  function handleSubscribe(event) {
    event.preventDefault();
    subscribe(planId, (login) ? login.id : '');
  }
  
  function handleApprove(event) {
    event.preventDefault();
    approve(plans[planId].token.toString(), planId, bn((plans[planId].amount  * occurences)));
  }

  const updateHandler = async(e) => {
    await updateBalance(selectedAddress)
    await updatePayable(e.target.value)
    await updateAllowance(e.target.value);
    if (plans) {
      if (plans[e.target.value].frequency.toString() == '0') {
        setOccurences(1);
      } else {
        setOccurences(12);
      } 
    }
    setPlanId(e.target.value);
    setSelectedToken(tokens.filter(t => t.address == plans[e.target.value].token.toString())[0]);
    setPeriod(mapPlans(plans[e.target.value]).period);
  }

  const handleTelegramResponse = response => {
    setLogin({id: response.id, username: response.username, name: response.first_name});
  };
  const handleDisconnect = () => {
    setLogin(null);
  };
  

  const mapPlans = (x) => {
    if (!tokens || tokens.length === 0) return;
    const temp = x.frequency < 3600 ? "minutes" : x.frequency <= 86400 ? "hours" : "days";
    const t = tokens.filter(t => t.address == x.token.toString())[0];

    return {
      id: x.planId.toString(), 
      type: x.planType === 0 ? 'Telegram Access' : x.planType === 1 ? 'Discord Access' : 'Web Content',
      plan: x.planName.toString(),
      amount: parseFloat(x.amount.toString() / Math.pow(10, t.decimals)) + ' ' + t.symbol + ((x.frequency>0)?' each ' + Moment.duration(x.frequency*1000).as(temp) + ' ' + temp :''),
      period: Moment.duration(x.frequency*1000).as(temp) + ' ' + temp,
      merchant: x.merchantName.toString(),
    }
  }
  const mapPlansToSelect = (x) => {
    const value = mapPlans(x)
    return <option value={value.id} key={value.id}>{value.merchant + ' - ' + value.type + ' - ' + value.plan + ' - ' + value.amount}</option>
  }

  useEffect(() => {
    if (!occurences || parseInt(occurences) <= 0) {
      //setOccurences(12)
      //if (isNaN(document.getElementById('selectOccurence').value) || document.getElementById('selectOccurence').value <= 0) {
      //  document.getElementById('selectOccurence') && (document.getElementById('selectOccurence').value = '12');
      //}
    }
    if (miniMode && !planId && plans.length > 0) {
      updateBalance(selectedAddress)
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
            disabled={!selectedToken || (selectedToken && selectedToken.balance.toString() === '0') || !planId}>Approve</CButton>
          </>
        )}
        {selectedToken && selectedToken.balance.toString() !== '0' && allowance && allowance.toString() === '0' && (
          <CAlert color="info" dismissible>
          Click on &quot;Approve&quot; to authorize needed amount to renew during next {occurences} periods.
        </CAlert>
        )}
        {(isPayable) && (
          <>
          <CButton color="primary" onClick={handleSubscribe} 
          disabled={!isPayable || !planId}>
            Subscribe now</CButton>
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
      <Wallet />
      <CForm className="row g-3">
        <CCol md={8}>
          <CFormLabel htmlFor="selectOccurence">Select a plan: </CFormLabel>
          <CFormSelect id="selectPlan" size="lg" className="mb-3" aria-label="Large select example"
          onChange={updateHandler}>
          <option value="">Choose a plan to subscribe</option>
          {plans.map(mapPlansToSelect)}
          </CFormSelect> 
        </CCol>
        <CCol id="telegramLogin" xs={4} hidden={!planId || !plans || plans[planId].planType.toString() != "0"}>
          {(!login || !login.id) && (
            <>
            <CFormLabel htmlFor="selectTg">Log in your Telegram account:</CFormLabel>
            <TelegramLoginButton id="selectTg" dataOnauth={handleTelegramResponse} botName="subscriptions_by_bot" />
            </>
            )}
          {login && login.id && (
            <>
            <CFormLabel htmlFor="btnTg">Logged as {login.name}</CFormLabel>
            <CButton id="btnTg" color="primary" onClick={handleDisconnect} size="lg" className="mb-3" aria-label="Large select example">Disconnect @{login.username}</CButton>
            </>
          )}
        </CCol>   
        <CCol md={3} hidden={!planId || plans[planId].frequency == 0 || (plans[planId].planType.toString() == "0" && !login)}>
            <p>
            <CFormLabel htmlFor="selectOccurence">Periods {occurences}x{period}{period && period && (<>={parseFloat(period)*parseInt(occurences)} {period.split(' ')[1]}</>)} </CFormLabel>
            <CFormInput type="number" id="selectOccurence"
             size="lg" className="mb-3" aria-label="Large select example"
             placeholder="eg for 1 year: 12" onChange={(e) => {
               setOccurences(parseInt(e.target.value));
              }} disabled={!planId} value={occurences}/>
            </p>
        </CCol>
        <CCol md={4} hidden={!planId || (plans[planId].planType.toString() == "0" && !login)}>
            <CFormLabel htmlFor="btn">Add {planId && ((plans[planId].amount * occurences) / Math.pow(10,selectedToken.decimals))} {selectedToken && (selectedToken.symbol)} to allowance</CFormLabel>
            <br/>
          <CButton color="primary" onClick={handleApprove}  size="lg" className="mb-3" aria-label="Large select example"
            disabled={!selectedToken || (selectedToken && selectedToken.balance.toString() === '0') || !planId}>Approve</CButton>
        </CCol>
        <CCol md={8} hidden={!planId || (plans[planId].planType.toString() == "0" && !login)}>
          {selectedToken && selectedToken.balance.toString() !== '0' && allowance && allowance.toString() === '0' && (
            <CAlert color="warning">
            You need to approve {planId && (parseFloat(occurences * plans[planId].amount.toString() / Math.pow(10, selectedToken.decimals)))} {selectedToken && (selectedToken.symbol)}&nbsp;
            {plans[planId].frequency > 0 && (
              <>
              needed to renew during {parseFloat(period)*parseInt(occurences)} {period.split(' ')[1]}
              </>
            )}
            {plans[planId].planType.toString() != 3 && plans[planId].frequency > 0 && (
              <> (renewed each {period})</>
            )}
          </CAlert>
          )}
          {planId && selectedToken && selectedToken.balance.toString() === '0' && (
          <CAlert color="warning">
            You needed {selectedToken && (<>{selectedToken.name} ({selectedToken.symbol})</>)} in your wallet.
          </CAlert>
          )}
          {allowance > 0 && !isPayable && selectedToken && (
            <CAlert color="warning" dismissible onClose={e => dispatch({type: 'set', allowance: 0})}>
            Not enough allowance to pay this subscription: only {allowance / Math.pow(10, selectedToken.decimals)} allowed.
          </CAlert>
          )}
          
        </CCol>
        <TransactionErrorMessage />
        <WaitingForTransactionMessage />
        <CCol md={8} hidden={!planId || (plans[planId].planType.toString() == "0" && !login)}>
          {(isPayable && selectedToken) && (
            <CAlert color="success">
          Click on &quot;Subscribe now&quot; to start your plan ! Your allowance is {allowance / Math.pow(10,selectedToken.decimals)} {selectedToken && (selectedToken.symbol)}.
          </CAlert>
          )}
          <CButton color="primary"
          size="lg" className="mb-3" aria-label="Large select example"
          onClick={handleSubscribe} disabled={!isPayable || !planId || (plans.length>0 && planId && plans[planId].planType.toString()==='0' && !login)}>Subscribe now</CButton>
        </CCol>
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