import React from 'react'
import { useSelector } from 'react-redux'
import Wallet from '../../components/Wallet'
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
import { Withdraw } from 'src/components/Withdraw'

const Dashboard = () => {
  const selectedAddress = useSelector((state) => state.selectedAddress)
  const plans = useSelector((state) => state.plans)
  const subscriptions = useSelector((state) => state.subscriptions)
  const tokens = useSelector((state) => state.tokens)
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

  return (
    <>
      <h4>Welcome {selectedAddress} !</h4>
      <Wallet />
      <Withdraw />
      <br/>
      <CRow>
      <CCol xs={6}>
          <CWidgetStatsF
            className="mb-3"
            color="primary"
            footer={
              plans && plans.length > 0 && (
                <CLink
                className="font-weight-bold font-xs text-medium-emphasis"
                href="/#/plan/list"
                >
                View more
                <CIcon icon={cilArrowRight} className="float-end" width={16} />
              </CLink>
              )
            }
            icon={<CIcon icon={cilDollar} height={24} />}
            title="Your plans"
            value={plans.length} />
          <CLink
            className="font-weight-bold font-xs text-medium-emphasis"
            href="/#/plan/create"
          >
            <CIcon icon={cilArrowRight} className="float-left" width={16} />
            &nbsp;Create a plan
          </CLink>
        </CCol>
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
            title={"You have " + subscriptions.length + " subscriptions"}
            value={subscriptions.length} />
          <CLink
            className="font-weight-bold font-xs text-medium-emphasis"
            href="/#/subscription/create"
          >
            <CIcon icon={cilArrowRight} className="float-left" width={16} />
            &nbsp;Subscribe to a plan
          </CLink>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
