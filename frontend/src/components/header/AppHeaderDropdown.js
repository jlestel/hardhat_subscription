import React from 'react'
import {
  CAvatar,
  CBadge,
  CButton,
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
  cilCheck,
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
  //const tokens = useSelector((state) => state.tokens)
  const subscriptions = useSelector((state) => state.subscriptions)
  const plans = useSelector((state) => state.plans)
  const selectedNetwork = useSelector((state) => state.selectedNetwork)

  const dispatch = useDispatch()

  return (
    <>
      <CDropdown variant="nav-item">
        <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
          <CButton type="submit"
            onClick={(e) => {
              if (!selectedAddress) connectWallet(dispatch);
            }}>
            <CIcon icon={selectedAddress ? cilCheck : cilLockLocked} className="me-2" />
            {!selectedAddress && ("Connect Wallet")}
            {selectedAddress && ("Connected")}
          </CButton>
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
          <CDropdownHeader className="bg-light fw-semibold py-2">My Merchant Plans</CDropdownHeader>
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
          <CDropdownHeader className="bg-light fw-semibold py-2">@ {selectedAddress && (selectedAddress.toString().substr(1, 30)+'...')}</CDropdownHeader>
          <CDropdownHeader className="bg-light fw-semibold py-2">Use Metamask to disconnect</CDropdownHeader>
        </CDropdownMenu>
      </CDropdown>
      {selectedNetwork && selectedNetwork !== undefined && (
        <CDropdown variant="nav-item">
          <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
            <CButton>
              <CIcon icon={cilCloudy} className="me-2" />
              {selectedNetwork.networkName}
            </CButton>
            <CDropdownMenu className="pt-0" placement="bottom-end">
              <CDropdownHeader className="bg-light fw-semibold py-2">Switch Network in Metamask</CDropdownHeader>
              <CDropdownItem>
                Ethereum Goerli Testnet
              </CDropdownItem>
              <CDropdownItem>
                Polygon Mumbai Testnet
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdownToggle>
        </CDropdown>
      )}
    </>
  )
}

export default AppHeaderDropdown
