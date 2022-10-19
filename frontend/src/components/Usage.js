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
import { Api } from "./Api";
import Pricing from "./Pricing";

export function Usage({ }) {
  const selectedAddress = useSelector((state) => state.selectedAddress);

  return (
    <div className="container">
      <h2>The most effective way to accept crypto payments in minutes</h2>
      
      <h4>and get paid in one-time, by subscription or by the duration.</h4>
        <CCallout color="success" className="text-center">
        We offer this <b>App and a suite of APIs, tooling and Smart Contracts</b> that enables a superior product experience to offer <b>crypto payment in any business</b>
        </CCallout>
        <ul>
          <li>If you’re an <b>offline company or individual</b>, you can easily create crypto subscriptions or payments for any <a href="/#/usecases">use-cases outlined below</a></li>
          <li>If you’re a <b>Web company or a content creator</b> then <b>you can add Web3 experience to your business in minutes</b>, and get paid by tokens / stable coins</li>
          <li>If you’re a <b>Web3 company or you serve Web3 companies</b>, DAOs, or <b>Private Telegram / Discord Communities</b>, then <b>you need automation</b></li>
        </ul>
      <CRow>
        <CCol sm={4}>
          <CCard className="text-center">
            <CCardBody>
              <CCardTitle>Recurring payment</CCardTitle>
              <CCardText>
                Accept crypto for your <b>subscription business</b> without your end-customers having to initiate every payment.
              </CCardText>
              <CButton href="/#/plan/create" disabled={!selectedAddress}>Create a plan</CButton>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={4}>
          <CCard className="text-center">
            <CCardBody>
              <CCardTitle>Pay per view time (duration)</CCardTitle>
              <CCardText>
                End-customer <b>is charged based on the time spent viewing your content.</b><br/><a href="https://4166307680926337.player.payperblock.xyz/playerppb" target="_blank" rel="noreferrer">Run a by &quot;Pay per duration&quot; live example now</a>
              </CCardText>
              <CButton href="/#/plan/create" disabled={!selectedAddress}>Create a plan</CButton>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={4}>
          <CCard className="text-center">
            <CCardBody>
              <CCardTitle>One-time payment</CCardTitle>
              <CCardText>
                Accept a <b>one-time crypto payment</b> to give access to your content or anything else. Access is lifetime while not cancelled by customer.
              </CCardText>
              <CButton href="/#/plan/create" disabled={!selectedAddress}>Create a plan</CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CCallout color="secondary"  className="text-center">
      <b>The origin of payment by access duration:</b> <a href="https://en.wikipedia.org/wiki/Minitel">Minitel</a> was invented in France 40 years ago. <br/>This payment method is now back thanks to Web3... and to a decentralized organization of French innovators!
      </CCallout>
      <CCallout color="primary">
        <p>For subscriptions payments (recurring or by duration), your end-customers maintain control over their assets while <b>removing the need to sign every recurring transaction</b>. Subscription is charged while <b>token allowed amount is sufficient</b>.</p>
      <p>
        Our smart contrat allows for true autopay - <b>no locking up funds; no withdrawals, ever</b>.<br/>
        A real transparency, removing the headache of (recurring) payments for everyone. <br/><br/>

        Reduced churn, increase conversion, and save hours not having to follow up with customers each period.
      </p>
      </CCallout>
      <h2>Want to monetize your content or anything for crypto?</h2>
      <h4>Everything is automated WITHOUT CODE for any business:</h4>
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
        <CAccordionItem itemKey={4}>
          <CAccordionHeader><b>Only accept crypto</b>: we manage subscriptions and payments for you even if you&apos;re not selling content.</CAccordionHeader>
          <CAccordionBody>
          You can insert our payment solution on your website or directly in your physical store by sharing the link to subscribe to your plans.
          </CAccordionBody>
        </CAccordionItem>
      </CAccordion>
      <br/>
      <Api />
      <br/>
      <Pricing />
    </div>
  );
}

export default Usage