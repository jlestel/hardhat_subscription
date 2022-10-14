import React from 'react'
import { useSelector } from 'react-redux'
import { Subscribe } from '../../components/Subscribe'
import { Subscriptions } from '../../components/Subscriptions'
import { SubscriptionResult } from '../../components/SubscriptionResult'
import { faucets } from "../../components/Dapp";

import {
  CCol,
  CButton,
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

import { useState } from "react";

const Faucet = () => {
  const selectedAddress = useSelector((state) => state.selectedAddress)
  const selectedNetwork = useSelector((state) => state.selectedNetwork)

  const [isUsed, setIsUsed] = useState(null);
  
  return (
    <>
    {selectedNetwork && selectedNetwork.networkName && (
      <div className="container">
      <div className="row justify-content-md-center">
        <div className="text-center">
          <h4>Don&apos;t have tokens to try in your Wallet?</h4>

          {isUsed && ("You will receive soon faucets...")}
          {!isUsed && (
            <>
            Ask for a faucet now &nbsp; <CButton type="submit" onClick={(e) => {
              faucets(selectedAddress);
              setIsUsed(true);
            }} disabled={isUsed}>Send Request</CButton>
            </>
          )}
        </div>
      </div>
    </div>  
    )}
    <br/>
    </>
  )
}

export default Faucet
