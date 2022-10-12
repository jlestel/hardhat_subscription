import React from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
  cilCloudy,
  cilAt,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/8.jpg'

import { useState } from "react";
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { connectWallet, reset } from "../Dapp";

const AppHeaderDropdown = () => {
  const selectedAddress = useSelector((state) => state.selectedAddress)
  const balance = useSelector((state) => state.balance)
  const tokenData = useSelector((state) => state.tokenData)
  const subscriptions = useSelector((state) => state.subscriptions)
  const plans = useSelector((state) => state.plans)
  const selectedNetwork = useSelector((state) => state.selectedNetwork)
  
  const dispatch = useDispatch()

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
          {selectedAddress && (
            <CBadge color="info" className="ms-2">
              <CIcon icon={cilAt} className="me-2" />
            {selectedAddress}
            </CBadge>
          )}
          {!selectedAddress && (
            <CBadge color="warning" className="ms-2">
              <CIcon icon={cilAt} className="me-2" />
            Not Connected
            </CBadge>
          )}
          {selectedNetwork && selectedNetwork !== undefined && (
          <CBadge color="info" className="ms-2">
            <CIcon icon={cilCloudy} className="me-2" />
            {selectedNetwork.networkName}
          </CBadge>
          )}
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-light fw-semibold py-2">My Subscriptions</CDropdownHeader>
        <CDropdownItem href="/#/subscription/list">
          <CIcon icon={cilUser} className="me-2" />
          Subscriptions
          <CBadge color="success" className="ms-2">
          {subscriptions.length}
          </CBadge>
        </CDropdownItem>
        <CDropdownItem href="/#/subscription/create">
          <CIcon icon={cilUser} className="me-2" />
          Subscribe to a plan
        </CDropdownItem>
        <CDropdownHeader className="bg-light fw-semibold py-2">Merchant</CDropdownHeader>
        <CDropdownItem href="/#/plan/list">
          <CIcon icon={cilTask} className="me-2" />
          Plans
          <CBadge color="danger" className="ms-2">
            {plans.length}
          </CBadge>
        </CDropdownItem>
        <CDropdownItem href="/#/plan/create">
          <CIcon icon={cilCreditCard} className="me-2" />
          Create a plan
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem href="#" onClick={(e) => {
          if (selectedAddress)
            reset()
          else
            connectWallet(dispatch)
        }}>
          <CIcon icon={cilLockLocked} className="me-2" />
          {!selectedAddress && ("Connect Wallet")}
          {selectedAddress && ("Disconnect Wallet")}
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
