import PropTypes from 'prop-types'
import React, { useEffect, useState, createRef } from 'react'
import classNames from 'classnames'
import { CRow, CCol, CCard, CCardHeader, CCardBody, CButton, CCardTitle, CCardText } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cibTelegram, 
  cibDiscord,
  cibSafari
} from '@coreui/icons'
import { cancel, validSubscription } from "../../../components/Dapp";

import { rgbToHex } from '@coreui/utils'
import { DocsLink } from 'src/components'
import Moment from 'moment';
import { useSelector } from 'react-redux'

const ThemeView = () => {
  const [color, setColor] = useState('rgb(255, 255, 255)')
  const ref = createRef()
  const subscriptions = useSelector((state) => state.subscriptions)
  
  useEffect(() => {
    const el = ref.current.parentNode.firstChild
    const varColor = window.getComputedStyle(el).getPropertyValue('background-color')
    setColor(varColor)
  }, [ref])

  return (
    <table className="table w-100" ref={ref}>
      <tbody>
        <tr>
          <td className="text-medium-emphasis">HEX:</td>
          <td className="font-weight-bold">{rgbToHex(color)}</td>
        </tr>
        <tr>
          <td className="text-medium-emphasis">RGB:</td>
          <td className="font-weight-bold">{color}</td>
        </tr>
      </tbody>
    </table>
  )
}

const ThemeColor = ({ className, nextPayment, merchantName, planName, planType, amount, children }) => {
  const classes = classNames(className, 'theme-color w-75 rounded mb-3')
  return (
    <CCol xs={12} sm={6} md={4} xl={2} className="mb-4">
      <div className={classes} style={{ paddingTop: '75%' }}></div>
      {children}
    </CCol>
  )
}

ThemeColor.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  merchantName: PropTypes.string,
  planName: PropTypes.string,
  planType: PropTypes.string,
  amount: PropTypes.string,
  nextPayment: PropTypes.string,
}

const mapSubscriptions = (x) => {
  const temp = x.plan.frequency < 3600 ? "minutes" : x.plan.frequency <= 86400 ? "hours" : "days"
  return {
    id: x.subscriptionId.toString(), 
    startedAt: Moment(x.start * 1000).format('DD/MM/YYYY h:m'),
    nextPayment: Moment(x.nextPayment * 1000).format('DD/MM/YYYY h:m'),
    planType: x.plan.planType === 0 ? cibTelegram : x.plan.planType === 1 ? cibDiscord : cibSafari,
    planName: x.plan.planName.toString(),
    amount: x.plan.amount.toString() + ' ' + x.plan.tokenName.toString() + ' each ' + Moment.duration(x.plan.frequency*1000).as(temp) + ' ' + temp,
    merchant: x.plan.merchantName.toString(),
  }
}


const Colors = () => {
  const [subscriptionId, setSubscriptionId] = useState(null);

  const subscriptions = useSelector((state) => state.subscriptions)

  function handleCancel(e) {
    e.preventDefault()
    //const subscriptionId = e.target.value
    cancel(subscriptions.filter(e => e.subscriptionId.toString() === subscriptionId)[0].plan.planId)
  }
  
  function handleAccess(subscriptionId) {
    e.preventDefault();
    validSubscription(null, subscriptions.filter(e => e.subscriptionId.toString() === subscriptionId)[0])
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          My Subscriptions
        </CCardHeader>
        <CCardBody>
          <CRow>
            {subscriptions && (
              subscriptions.map((x) => {
                const value = mapSubscriptions(x)
                return (
                  <CCard key={value.subscriptionId} className="mb-2" style={{ maxWidth: '640px' }}>
                    <CRow className="g-0">
                      <CCol md={4}>
                      <CIcon icon={value.planType} customClassName="primary"  />
                      </CCol>
                      <CCol md={8}>
                        <CCardBody>
                          <CCardTitle>{value.planName}</CCardTitle>
                          <CCardText>
                            {value.amount}
                          </CCardText>
                          <CCardText>
                            <small className="text-medium-emphasis">Seller: {value.merchant}</small>
                            <br/>
                            <small className="text-medium-emphasis">Started at: {value.startedAt}</small>
                            <br/>
                            <small className="text-medium-emphasis">Next payment: {value.nextPayment}</small>
                          </CCardText>
                          <CButton component="a" href="#" color="primary" size="lg" onClick={(e) => {
                            e.preventDefault()
                            //setSubscriptionId(value.subscriptionId)
                            handleAccess(value.subscriptionId)
                          }}>Access Content</CButton>
                          &nbsp;
                          <CButton component="a" href="#" color="secondary" size="lg" onClick={(e) => {
                            e.preventDefault()
                            //setSubscriptionId(value.subscriptionId)
                            handleCancel(value.subscriptionId)
                          }}>Cancel</CButton>
                        </CCardBody>
                      </CCol>
                    </CRow>
                  </CCard>
                )
              })
            )}
            <ThemeColor className="bg-primary">
              <h6>Brand Primary Color</h6>
            </ThemeColor>
            <ThemeColor className="bg-secondary">
              <h6>Brand Secondary Color</h6>
            </ThemeColor>
            <ThemeColor className="bg-success">
              <h6>Brand Success Color</h6>
            </ThemeColor>
            <ThemeColor className="bg-danger">
              <h6>Brand Danger Color</h6>
            </ThemeColor>
            <ThemeColor className="bg-warning">
              <h6>Brand Warning Color</h6>
            </ThemeColor>
            <ThemeColor className="bg-info">
              <h6>Brand Info Color</h6>
            </ThemeColor>
            <ThemeColor className="bg-light">
              <h6>Brand Light Color</h6>
            </ThemeColor>
            <ThemeColor className="bg-dark">
              <h6>Brand Dark Color</h6>
            </ThemeColor>
          </CRow>
        </CCardBody>
      </CCard>
    </>
  )
}

export default Colors
