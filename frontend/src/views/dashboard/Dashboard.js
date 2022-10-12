import React from 'react'
import { useSelector } from 'react-redux'
import { Subscribe } from '../../components/Subscribe'
import { Subscriptions } from '../../components/Subscriptions'
import { SubscriptionResult } from '../../components/SubscriptionResult'
import {
  CCol,
  CWidgetStatsF,
  CRow,
  CLink,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilArrowRight,
  cilChartPie,
  cilDollar,
} from '@coreui/icons'

const Dashboard = () => {
  const selectedAddress = useSelector((state) => state.selectedAddress)
  const plans = useSelector((state) => state.plans)
  const subscriptions = useSelector((state) => state.subscriptions)
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

  return (
    <>
      <h4>Welcome {selectedAddress} !</h4>
      <CRow>
      <CCol xs={6}>
        <CWidgetStatsF
          className="mb-3"
          color="warning"
          footer={
            subscriptions && subscriptions.length > 0 && (
            <CLink
              className="font-weight-bold font-xs text-medium-emphasis"
              href="/#/subscription/list"
            >
              View more
              <CIcon icon={cilArrowRight} className="float-end" width={16} />
            </CLink>
          )}
          icon={<CIcon icon={cilChartPie} height={24} />}
          title={"You have "+ subscriptions.length +  " subscriptions"}
          value={subscriptions.length}/>
      </CCol>
      <CCol xs={2}>
      <CLink
        className="font-weight-bold font-xs text-medium-emphasis"
        href="/#/subscription/create"
      >
        Subscribe to a plan
        <CIcon icon={cilArrowRight} className="float-end" width={16} />
      </CLink>
      </CCol>
      </CRow><CRow>
      <CCol xs={6}>
        <CWidgetStatsF
          className="mb-3"
          color="primary"
          footer={
            <CLink
              className="font-weight-bold font-xs text-medium-emphasis"
              href="/#/plan/list"
            >
              View more
              <CIcon icon={cilArrowRight} className="float-end" width={16} />
            </CLink>
          }
          icon={<CIcon icon={cilDollar} height={24} />}
          title="Your plans"
          value={plans.length}/>
      </CCol>
      <CCol xs={2}>
      <CLink
        className="font-weight-bold font-xs text-medium-emphasis"
        href="/#/plan/create"
      >
        Create a plan
        <CIcon icon={cilArrowRight} className="float-end" width={16} />
      </CLink>
      </CCol>
    </CRow>
    </>
  )
}

export default Dashboard
