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

const Accordion = () => {
  return (
    <>
    <Subscribe miniMode={false}/>
    <SubscriptionResult/>
    </>
  )
}

export default Accordion
