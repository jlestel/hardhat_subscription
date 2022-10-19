import React from "react";
import Moment from 'moment';
import { useSelector } from 'react-redux'

import {
  CTable,
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
      label: '',
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
      subscriptionsPaid: x.paid && x.paid.toString() != '0' ? x.paid.toString() / Math.pow(10, t.decimals) : '0',
      subscriptionsReleased: x.released && x.released.toString()!= '0' ? x.released.toString() / Math.pow(10, t.decimals) : '0',
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
          </>

        )}
      <Withdraw />
    </div>
  );
}
