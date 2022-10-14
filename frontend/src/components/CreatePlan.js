import React from "react";
import Moment from 'moment';
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { createPlan, validPlan } from "./Dapp";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";

import {
  CAlert,
  CFormSelect,
  CTable,
  CButton,
  CForm,
  CCol,
  CFormInput,
  CFormCheck,
  CFormSwitch,
} from '@coreui/react'
 
export function CreatePlan(/*{ subscriptions, cancel, access }*/) {

  const [renew, setRenew] = useState(null);
  const [planType, setPlanType] = useState(null);
  const [duration, setDuration] = useState(null);
  const [token, setToken] = useState(null);

  const plans = useSelector((state) => state.plans)
  const selectedAddress = useSelector((state) => state.selectedAddress)
  const selectedNetwork = useSelector((state) => state.selectedNetwork)
  const isValidPlan = useSelector((state) => state.isValidPlan)
  const dispatch = useDispatch()

  useEffect(() => {
    if (renew === null) {
      setRenew(true)
      //if (isNaN(document.getElementById('selectOccurence').value) || document.getElementById('selectOccurence').value <= 0) {
      /*if (document.getElementById('checkRenew')) {
        document.getElementById('checkRenew').checked = true
      }*/
      //}
    }
    if (planType === null) {
      setPlanType('')
      //if (isNaN(document.getElementById('selectOccurence').value) || document.getElementById('selectOccurence').value <= 0) {
      //document.getElementById('selectPlanType').selectedValue = ''
      //}
    }
    if (duration === null) {
      setDuration('86400')
      //document.getElementById('selectDuration').selectedValue = 3
    }
  });
  const columns = [
    {
      key: 'id',
      label: '#',
      _props: { scope: 'col' },
    },
    {
      key: 'planType',
      label: 'Type',
      _props: { scope: 'col' },
    },
    {
      key: 'planName',
      label: 'Name',
      _props: { scope: 'col' },
    },
    {
      key: 'amount',
      label: 'Amount',
      _props: { scope: 'col' },
    },
  ]

  const mapPlans = (x) => {
    const temp = x.frequency < 3600 ? "minutes" : x.frequency <= 86400 ? "hours" : "days"
    return {
      id: x.planId.toString(), 
      planType: x.planType === 0 ? 'Telegram Access' : x.planType === 1 ? 'Discord Access' : 'Web Content',
      planName: x.planName.toString(),
      amount: x.amount.toString() + ' ' /*+ (await _getTokenData(plan.token)).symbol*/ + ' each ' + Moment.duration(x.frequency*1000).as(temp) + ' ' + temp, // x.tokenName.toString() 
      merchant: x.merchantName.toString(),
    }
  }
  

  const mapTokensToSelect = () => {
    //const value = mapPlans(x)
    if (!selectedNetwork) 
      return;
    console.log('env',selectedNetwork.tokens);
    return selectedNetwork.tokens.map(e => <option value={e.name} key={e.name}>{e.name}</option>);
  }
  const getToken = (tmp) => {
    const tokens = JSON.parse(process.env.REACT_APP_ALLOWED_TOKENS);
    if (!tmp) 
      return {name: "-", address: "0x0"}
    return selectedNetwork.tokens.filter(e => e.name == tmp)[0];
  }
  
  const submitHandle = (event) => {
    event.preventDefault()
    createPlan({
      address: getToken(token).address, 
      amount: parseInt(event.target.elements.inputAmount.value), 
      frequency: parseInt(event.target.elements.inputFrequency.value) * parseInt(duration), 
      planType: parseInt(planType),
      planTypeInfos: planType == '0' ? event.target.elements.inputTypeInfosTelegram.value : planType == '1' ? event.target.elements.inputTypeInfosDiscord.value : event.target.elements.inputTypeInfosUrl.value,
      //tokenName: getToken(token).name,
      planName: event.target.elements.inputPlanName.value,
      merchantName: event.target.elements.inputMerchantName.value,
      subscriberAddress: selectedAddress
    });
  }
  const handleValidPlan = (type, infos) => {
    validPlan(type, infos);
  }
  
  return (
    <div>
      <h4>Create a Plan</h4>
      <CForm id="create" className="row g-3" onSubmit={submitHandle}>
      <CCol md={6}>
          <CFormSelect name="selectPlanType" id="selectPlanType" label="Content Type" required onChange={(e) => {
            setPlanType(e.target.value)
            if (e.target.value == '3') {
              setRenew(true)
            }
            dispatch({ type: 'set', isValidPlan: null })
          }}>
            
            <option value="">What type of content do you want to monetize?</option>
            <option value="0">Telegram Private Channel Access</option>
            <option value="1">Discord Private Access</option>
            <option value="2">Web</option>
            <option value="3">Web (Payment by duration)</option>
          </CFormSelect>
        </CCol>
        {planType != '' && (
          <>
          <CCol xs={6} hidden={planType != "0"}>
            <p>First, add <a href="https://t.me/subscriptions_by_bot">@subscriptions_by_bot</a> as Administrator in your Telegram channel and then:
            <CButton type="button" onClick={(e) => {
              handleValidPlan(0, null );
            }}>Verify Telegram Channel Access</CButton></p>
          </CCol>
          <CCol xs={6} hidden={planType != "1"}>
            <CFormInput name="inputTypeInfosDiscords" label="Discord Channel ID" placeholder="Write your private Discord ID here"/>
            <p>You will need to add @subscriptions_bot as admin in this channel</p>
          </CCol>
          <CCol xs={6} hidden={planType == '' || parseInt(planType) < 2}>
            <CFormInput id="inputTypeInfosUrl" name="inputTypeInfosUrl" label="URL to monetize" placeholder="Write your private URL" onChange={() => dispatch({ type: 'set', isValidPlan: null })}/>
            {(!isValidPlan || !isValidPlan.valid) && (
              <CButton type="button" onClick={(e) => {
                handleValidPlan(parseInt(planType), document.getElementById('inputTypeInfosUrl').value);
              }}>Verify Web Access</CButton>
            )}
            <i>This URL will never be shown directly to your subscribers.</i>
          </CCol>
          <CCol md={12}>
            {isValidPlan && isValidPlan.error && (isValidPlan.error)}
            {isValidPlan && isValidPlan.valid && (
              <CAlert color="success">
                {isValidPlan.telegramChannel && (<>Well done! Bot can manage invite and users of your <b>{isValidPlan.telegramChannel}</b> Telegram Channel.</>)}
                {isValidPlan.url && (<>Well done! {isValidPlan.url} is alive.</>)}
                <br/>
                Complete form below to create a plan to monetize your content with Payperblock:
              </CAlert>
            )}
          </CCol>
          {isValidPlan && isValidPlan.valid && (
            <>
            <CCol md={4}>
              <CFormInput type="input" name="inputMerchantName" label="Merchant Name" required/>
            </CCol>
            <CCol md={4}>
              <CFormInput type="input" name="inputPlanName" label="Plan Name" required/>
            </CCol>
            <CCol md={4}>
              <CFormSelect id="selectToken" label="Token" onChange={(e) => {
                  e.preventDefault();
                  console.log('selectToken', e.target.value);
                  setToken(e.target.value);
                }} required>
                <option value="">Choose a token</option>
                {mapTokensToSelect()}  
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormInput type="number" name="inputAmount" label={"Amount " + getToken(token).name} required/>
            </CCol>
            <CCol md={1} hidden={!renew}>
              each
            </CCol>
            <CCol md={2} hidden={!renew}>
              <CFormInput type="number" name="inputFrequency" label="Frequency"/>
            </CCol>
            <CCol md={2} hidden={!renew}>
              <CFormSelect id="selectDuration" label="&nbsp;"
              onChange={(e) => {
                setDuration(e.target.value)
              }} defaultValue="86400">
                <option value="1">Seconds</option>
                <option value="60">Minutes</option>
                <option value="3600">Hours</option>
                <option value="86400">Days</option>
                <option value="2592000">Months</option>
                <option value="31104000">Years</option>
              </CFormSelect>
            </CCol>
            <CCol xs={12}>
              <CFormSwitch name="checkRenew" id="checkRenew" label="Renew frequency for this plan?" onChange={(e) => {
                setRenew(e.target.checked)
              }} disabled={planType == '3'} checked={renew}/>
            </CCol>
            <CCol xs={12}>
              <CButton type="submit" onClick={(e) => {
                document.getElementById('submit').click()
              }} disabled={!isValidPlan || !isValidPlan.valid}>Create this plan now</CButton>
              <p>(I will receive subscriptions on my wallet {selectedAddress})</p>
              <input type="submit" value="submit" id="submit" className="invisible" />
            </CCol>
            </>
          )}
          </>
        )}
      </CForm>
      <TransactionErrorMessage />
      <WaitingForTransactionMessage />
      <hr/>
      {plans.length > 0 && (
        <>
        <label>You have <a href="/#/plan/list">{plans.length} plans.</a></label>
        <CTable columns={columns} items={plans.map(mapPlans)} />
        </>
      )}
      {plans.length === 0 && (
        <>
        <label>You don&apos;t have plans.</label>
        </>
      )}
    </div>
  );
}
