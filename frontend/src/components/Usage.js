import React from "react";
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react';
import {
  CButton,
  CCard,
  CCardImage,
  CCardHeader,
  CCardBody,
  CCardTitle,
  CCardText,
  CCardFooter,
  CCallout,
  CAccordion,
  CAccordionItem,
  CRow,
  CCol,
  CAccordionHeader,
  CAccordionBody,
  CNavTitle,
} from '@coreui/react'
//import { useStore } from 'react-redux'

import { NetworkErrorMessage } from "./NetworkErrorMessage";
import { connectWallet } from "./Dapp";

export function Usage({ }) {
  const selectedAddress = useSelector((state) => state.selectedAddress);

  return (
    <div className="container">
      <h2>Monetize your content for cryptocurrencies</h2>
      <h4>Everything is automated for your Web, Telegram and Discord content:</h4>

      <CAccordion flush>
        <CAccordionItem itemKey={1}>
          <CAccordionHeader><b>Telegram</b>: we manage allowed users and subscriptions for you</CAccordionHeader>
          <CAccordionBody>
            After customer subscription, he&apos;ll receive a custom link to join.
            All (non-administrator) users without a valid subscription will be banned.
          </CAccordionBody>
        </CAccordionItem>
        <CAccordionItem itemKey={2}>
          <CAccordionHeader><b>Discord</b>: we manage allowed VIP users for you</CAccordionHeader>
          <CAccordionBody>
            <strong>This is the second item&apos;s accordion body.</strong> It is hidden by default, until the
            collapse plugin adds the appropriate classes that we use to style each element. These classes
            control the overall appearance, as well as the showing and hiding via CSS transitions. You can
            modify any of this with custom CSS or overriding our default variables. It&apos;s also worth noting
            that just about any HTML can go within the <code>.accordion-body</code>, though the transition
            does limit overflow.
          </CAccordionBody>
        </CAccordionItem>
        <CAccordionItem itemKey={3}>
          <CAccordionHeader><b>Web Content</b>: we manage access to your content without sharing your real URL</CAccordionHeader>
          <CAccordionBody>
            After customer subscription/payment, he&apos;ll receive a new player to access Web content.
            Depending on plan type, customer will be allowed to access again to the paid content:
            <ul>
              <li>Via one-time payment, customer will access forever to this content.</li>
              <li>Via subscription, customer will be able to access while subscription is paid.</li>
              <li>Via pay-per-duration, the customer will be billed per minute as long as the content is viewed in a browser. If the customer can no longer be collected, access to the content is then closed.</li>
            </ul>
          </CAccordionBody>
        </CAccordionItem>
      </CAccordion>

      <br />
      <h4>You can use 3 payment methods:</h4>

      <CCallout color="success">
        From a end-customers point of view, the payment process is always the same: approve an amount then pay the plan.
      </CCallout>
      <CRow>
        <CCol sm={4}>
          <CCard className="text-center">
            <CCardBody>
              <CCardTitle>1 - Recurring payment</CCardTitle>
              <CCardText>
                Accept cryptocurrency for your <b>subscription business</b> without your end-customers having to initiate every payment.
              </CCardText>
              <CButton href="/#/plan/create" disabled={!selectedAddress}>Create a plan</CButton>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={4}>
          <CCard className="text-center">
            <CCardBody>
              <CCardTitle>2 - One-time payment</CCardTitle>
              <CCardText>
                Accept a <b>one-time crypto payment</b> to give access to your content. Access is lifetime while not cancelled by customer.
              </CCardText>
              <CButton href="/#/plan/create" disabled={!selectedAddress}>Create a plan</CButton>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={4}>
          <CCard className="text-center">
            <CCardBody>
              <CCardTitle>3 - Payment by duration</CCardTitle>
              <CCardText>
                It&apos;s like a subscription payment but the end-customer <b>is charged based on the time spent viewing your content.</b>
              </CCardText>
              <CButton href="/#/plan/create" disabled={!selectedAddress}>Create a plan</CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CCallout color="success">
        For subscriptions payments (recurring or by duration), you will receive tokens without your end-customers having to initiate every payment. Subscription is charged while allowed amount is sufficient.
      </CCallout>
    </div>
  );
}

export default Usage