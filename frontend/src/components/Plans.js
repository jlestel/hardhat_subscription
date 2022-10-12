import React from "react";
import Moment from 'moment';
import { useState } from "react";
import { useSelector } from 'react-redux'

import { cancel, validSubscription } from "./Dapp";

import {
  CFormSelect,
  CTable,
  CButton,
} from '@coreui/react'
 
export function Plans(/*{ subscriptions, cancel, access }*/) {

  const plans = useSelector((state) => state.plans)

  const columns = [
    {
      key: 'id',
      label: 'Plan ID',
      _props: { scope: 'col' },
    },
    {
      key: 'merchant',
      label: 'Merchant',
      _props: { scope: 'col' },
    },
    {
      key: 'planName',
      label: 'Name',
      _props: { scope: 'col' },
    },
    {
      key: 'plan',
      label: 'Infos',
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
      planName: x.planName.toString(),
      plan: 
        (x.planType === 0 ? 'Telegram Access' : x.planType === 1 ? 'Discord Access' : x.planType === 2 ? 'Web' : 'Web (by duration)') + ': ' + x.planTypeInfos.toString(),
      amount: x.amount.toString() + ' ' + x.tokenName.toString() + ' each ' + Moment.duration(x.frequency*1000).as(temp) + ' ' + temp,
      merchant: x.merchantName.toString()
    }
  }
  const columnsEmbeed = [
    {
      key: 'planName',
      label: 'Name',
      _props: { scope: 'col' },
    },
    {
      key: 'header',
      label: 'Name',
      _props: { scope: 'col' },
    },
    {
      key: 'embeed',
      label: 'Copy in Body',
      _props: { scope: 'col' },
    },
  ]
  const mapEmbeed = (x) => {
    const temp = x.frequency < 3600 ? "minutes" : x.frequency <= 86400 ? "hours" : "days"
    return {
      planName: x.planName.toString(),
      header: '<script defer="defer" src="https://payperblock.citio.digital/static/js/main.14a1360c.js"></script><link href="https://payperblock.citio.digital/static/css/main.606b1f02.css" rel="stylesheet">',
      embeed: '<div id="payperblock" data-plan-id="' + x.planId.toString() + '"></div>',
    }
  }
  
  return (
    <div>
      <h4>My Plans</h4>

        {plans.length == 0 && (
          <>
          <label>No plans.</label>
          Monetize your content and <a href="/#/plan/create">create a plan now</a>.
          </>
        )}
        {plans.length > 0 && (
          <>
          <label>You have {plans.length} plans:</label>
          <CTable columns={columns} items={plans.map(mapPlans)} />
          <hr/>
          <h4>How to embeed a button plan into my Website?</h4>
          <p>Copy / paste the following code into the head/body of your Website: </p>
          <CTable columns={columnsEmbeed} items={plans.map(mapEmbeed)} />
          </>

        )}
    </div>
  );
}
