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

import Subscribe from 'src/components/Subscribe'
import { SubscriptionResult } from 'src/components/SubscriptionResult'
import { TransactionErrorMessage } from 'src/components/TransactionErrorMessage'

const MySubscribe = () => {
  return (
    <>
    <Subscribe miniMode={false}/>
    <SubscriptionResult/>
    </>
  )
}

export default MySubscribe
