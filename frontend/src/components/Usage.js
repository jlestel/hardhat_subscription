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
      <h2>The most effective way to accept crypto payments in minutes</h2>
      
      <h4>and get paid in one-time, by subscription or by the duration.</h4>
        <CCallout color="success">
        Available soon on Ethereum, Polygon, Avalanche, BNB and Fantom blockchain. To try it now, just connect and switch to Goerli Testnet.
        </CCallout>
        <p>We offer a <b>suite of APIs, tooling and smart contracts</b> that enables a superior product experience to offer <b>crypto payment in any business</b>.</p>
        <p>
        If you’re a <b>Web3 company or you serve Web3 companies</b>, DAOs, or communities, then <b>you need automation</b>.<br/>
        If you’re a <b>Web2 company or a content creator</b> then <b>you could be paid by tokens</b>, and add Web3 experience to your business.</p>
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
      <CCallout color="primary">
        <p>For subscriptions payments (recurring or by duration), your end-customers maintain control over their assets while <b>removing the need to sign every recurring transaction</b>. Subscription is charged while <b>token allowed amount is sufficient</b>.</p>
      <p>
        Our smart contrat allows for true autopay - <b>no locking up funds; no withdrawals, ever</b>.<br/>
        A real transparency, removing the headache of (recurring) payments for everyone. <br/><br/>

        Reduced churn, increase conversion, and save hours not having to follow up with customers each period.
      </p>
      </CCallout>
      
      <h2>Want to monetize your content for cryptocurrencies?</h2>
      <h4>Everything is automated WITHOUT CODE for your Web, Telegram and Discord content:</h4>
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
            After customer subscription, he&apos;ll receive a custom link to join.
            All (non-administrator) users without a valid subscription will be banned.
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
      <br/>
      <h2>Want to integrate Web3 payment methods in your business?</h2>
      <h4>Integrates seamlessly Payperblock into your business stack:</h4>
      <CRow>
      <CCol xs>
          <CCard>
            <CCardBody>
              <CCardTitle>Receipts and reminders</CCardTitle>
              <CCardText>
              Spend less time tracking down payments and more time growing your business.<br/>
              We send reminders, and payment retries - so you don’t have to.
              </CCardText>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs>
          <CCard>
            <CCardBody>
              <CCardTitle>Front / API</CCardTitle>
              <CCardText>
              You can share our default payment page to your customers.<br/>
              Or integrate payment via our Javascript API with a few lines of code.
              </CCardText>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs>
          <CCard>
            <CCardBody>
              <CCardTitle>Webhooks</CCardTitle>
              <CCardText>
              You can use Webhooks to make integration seamless. <br/>
              Save hours of manual reconciliation work by connecting with systems you already use.
              </CCardText>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
}

export default Usage