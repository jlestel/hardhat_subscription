import React from 'react'
import { CCard, CCardHeader, CCardBody } from '@coreui/react'
import { DocsLink } from 'src/components'
import { Subscriptions } from 'src/components/Subscriptions'
import { SubscriptionResult } from 'src/components/SubscriptionResult'
import { TransactionErrorMessage } from "src/components/TransactionErrorMessage";
import { WaitingForTransactionMessage } from "src/components/WaitingForTransactionMessage";

const MySubscriptions = () => {
  return (
    <>
      <Subscriptions />
      <SubscriptionResult />
      <TransactionErrorMessage />
      <WaitingForTransactionMessage />
    </>
  )
}

export default MySubscriptions
