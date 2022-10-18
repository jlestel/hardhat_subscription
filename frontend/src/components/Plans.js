import React from "react";
import Moment from 'moment';
import { useState, useEffect } from "react";
import { useSelector } from 'react-redux'

import { release } from "./Dapp";

import {
  CFormSelect,
  CTable,
  CButton,
} from '@coreui/react'
import { Withdraw } from "./Withdraw";
 
export function Plans(/*{ subscriptions, cancel, access }*/) {

  const plans = useSelector((state) => state.plans)
  const subscriptions = useSelector((state) => state.allSubscriptions)
  const tokens = useSelector((state) => state.tokens)

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
    {
      key: 'subscriptions',
      label: 'Subscription(s)',
      _props: { scope: 'col' },
    },
    {
      key: 'subscriptionsPaid',
      label: 'Paid',
      _props: { scope: 'col' },
    },
    {
      key: 'subscriptionsReleased',
      label: 'Withdrawn',
      _props: { scope: 'col' },
    },
  ]

  const mapPlans = (x) => {
    if (!tokens || tokens.length === 0) return;
    const temp = x.frequency < 3600 ? "minutes" : x.frequency <= 86400 ? "hours" : "days"
    const t = tokens.filter(t => t.address == x.token.toString())[0];
    const subs = subscriptions.filter(e => e.planId.toString() === x.planId.toString());
    return {
      id: x.planId.toString(), 
      planName: x.planName.toString(),
      plan: 
        (x.planType === 0 ? 'Telegram Access' : x.planType === 1 ? 'Discord Access' : x.planType === 2 ? 'Web' : 'Web (by duration)') + ': ' + x.planTypeInfos.toString(),
      amount: (x.amount.toString() / Math.pow(10, t.decimals)) + ' ' + t.symbol/*+ x.tokenName.toString() */+ ((x.frequency > 0) ? ' each ' + Moment.duration(x.frequency*1000).as(temp) + ' ' + temp : ''),
      merchant: x.merchantName.toString(),
      subscriptions: subs.length > 0 ? subs.length : '0',
      //subscriptionsPaid: subs.length > 0 ? subs.map(e => e.paid).reduce((a,b) => (a / Math.pow(10, t.decimals)) + (b / Math.pow(10, t.decimals)), 0) : 0,
      subscriptionsPaid: x.paid.toString() != '0' ? x.paid.toString() / Math.pow(10, t.decimals) : '0',
      subscriptionsReleased: x.released.toString()!= '0' ? x.released.toString() / Math.pow(10, t.decimals) : '0',
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
      <Withdraw />
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
