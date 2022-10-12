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
 
export function Subscriptions(/*{ subscriptions, cancel, access }*/) {

  const [subscriptionId, setSubscriptionId] = useState(null);

  const subscriptions = useSelector((state) => state.subscriptions)
  const plans = useSelector((state) => state.allPlans)

  function handleCancel(event) {
    event.preventDefault()
    cancel(subscriptions.filter(e => e.subscriptionId.toString() === subscriptionId)[0].subscriptionId)
  }
  
  function handleAccess(event) {
    event.preventDefault();
    const sub = subscriptions.filter(e => e.subscriptionId.toString() === subscriptionId)[0];
    validSubscription(
      null, 
      sub,
      plans[sub.planId]
    )
  }

  const columns = [
    {
      key: 'id',
      label: '#',
      _props: { scope: 'col' },
    },
    {
      key: 'startedAt',
      label: 'Created at',
      _props: { scope: 'col' },
    },
    {
      key: 'nextPayment',
      label: 'Next payment',
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

  const mapSubscriptions = (x) => {
    if (plans.length===0) return;
    const plan = plans[x.planId];
    const temp = plan.frequency < 3600 ? "minutes" : plan.frequency <= 86400 ? "hours" : "days"
    return {
      id: x.subscriptionId.toString(), 
      startedAt: Moment(x.start * 1000).format('DD/MM/YYYY h:m'),
      nextPayment: Moment(x.nextPayment * 1000).format('DD/MM/YYYY h:m'),
      planType: plan.planType === 0 ? 'Telegram Access' : plan.planType === 1 ? 'Discord Access' : 'Web Content',
      planName: plan.planName.toString(),
      amount: plan.amount.toString() + ' ' + plan.tokenName.toString() + ' each ' + Moment.duration(plan.frequency*1000).as(temp) + ' ' + temp,
      merchant: plan.merchantName.toString(),
    }
  }
  const mapSubscriptionsToSelect = (x) => {
    const value = mapSubscriptions(x)
    return <option value={value.id} key={value.id}>{value.planName + ' - ' + value.planType + ' - Next Payment: ' + value.nextPayment}</option>
  }
  
  return (
    <div>
      <h4>My Subscriptions</h4>
        {subscriptions.length === 0 && (
          <>
          <label>You have not subscribed yet.</label>
          Check <a href="/#/subscription/create">available plans</a>.
          </>
        )}
        {subscriptions && subscriptions.length > 0 && (
          <>
          <label>You have {subscriptions.length} subscribtion:</label>
          <CTable columns={columns} items={subscriptions.map(mapSubscriptions)} />
          <div className="form-group">
              <h5>Actions: </h5>
            <CFormSelect size="lg" className="mb-3" aria-label="Large select example"
              onChange={(e) => {
                setSubscriptionId(e.target.value);
              }}>
              <option value="">Choose a subscription</option>
              {subscriptions.map(mapSubscriptionsToSelect)}
            </CFormSelect>          
          </div>
          <div className="form-group">
            <CButton component="a" href="#" color="primary" size="lg" onClick={handleAccess} disabled={subscriptionId === undefined || subscriptionId === ''}>Access Content</CButton>
            &nbsp;
            <CButton component="a" href="#" color="secondary" size="lg" onClick={handleCancel} disabled={subscriptionId === undefined || subscriptionId === ''}>Cancel</CButton>
          </div>
          </>
        )}
    </div>
  );
}
