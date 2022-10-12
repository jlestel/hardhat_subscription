import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CAccordion,
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
} from '@coreui/react'
import { DocsExample } from 'src/components'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import Subscribe from 'src/components/Subscribe'
import { SubscriptionResult } from 'src/components/SubscriptionResult'
import { TransactionErrorMessage } from 'src/components/TransactionErrorMessage'
import ConnectWallet from 'src/components/ConnectWallet'
import { NoWalletDetected } from 'src/components/NoWalletDetected'

const ShareSubscribe = () => {

  const eth = window.ethereum
  const address = useSelector((state) => state.selectedAddress)

  const { id } = useParams();

  return (
    <>
    {eth === undefined && (
      <NoWalletDetected />
      )}
    {eth && !address && (
      <ConnectWallet />
    )}
    {eth && address && (
      <>
      <Subscribe miniMode={true}/>
      </>
    )}
    </>
  )
}

export default ShareSubscribe
