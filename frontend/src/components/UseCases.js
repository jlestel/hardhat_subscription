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

export function UseCases({ }) {
  const selectedAddress = useSelector((state) => state.selectedAddress);

  return (
    <div className="container">
      <h2>Sample use-cases:</h2>

      <CRow xs={{ cols: 1, gutter: 4 }} md={{ cols: 3 }}>
      <CCol xs>
          <CCard>
            <CCardBody>
              <CCardTitle>Web content recurring payments</CCardTitle>
              <CCardText>
                Monetize your online content access:<br />
                - Make sections of your site paid<br />
                - Sell PDF access for crypto<br />
                - Sell a subcription on any Web / Metaverse access<br />
              </CCardText>
            </CCardBody>
            <CCardFooter>
              <small className="text-medium-emphasis">Eg: sell access to a content page on my Website</small>
            </CCardFooter>
          </CCard>
        </CCol>
        <CCol xs>
          <CCard>
            <CCardBody>
              <CCardTitle>Telegram/Discord VIP Subscriptions</CCardTitle>
              <CCardText>
                Create invitations and manage access for you:<br />
                - Lifetime access<br />
                - Subscription access<br />
                All users without a valid subscription are banned.
              </CCardText>
            </CCardBody>
            <CCardFooter>
              <small className="text-medium-emphasis">Eg: sell and manage a private Telegram Channel access</small>
            </CCardFooter>
          </CCard>
        </CCol>
        <CCol xs>
          <CCard>
            <CCardBody>
              <CCardTitle>Make transaction to an address every X days</CCardTitle>
              <CCardText>
                Example use-cases:<br />
                - online wallet<br />
                - mining pool<br />
                - donation / savings address<br />
              </CCardText>
            </CCardBody>
            <CCardFooter>
              <small className="text-medium-emphasis">Eg: send 0.2 ETH each month to my daughter Wallet</small>
            </CCardFooter>
          </CCard>
        </CCol>
        <CCol xs>
          <CCard>
            <CCardBody>
              <CCardTitle>SaaS / Ecommerce recurring payments</CCardTitle>
              <CCardText>
                A merchant provides subscription-based service:<br/>
                - Recurring product shipping plan<br/>
                - SaaS subscription management<br/>
                - Subscription validity is given our smart contract<br/>
              </CCardText>
            </CCardBody>
            <CCardFooter>
              <small className="text-medium-emphasis">Eg: sell subscriptions for any SaaS</small>
            </CCardFooter>
          </CCard>
        </CCol>
        <CCol xs>
          <CCard>
            <CCardBody>
              <CCardTitle>Payment by duration</CCardTitle>
              <CCardText>
                Paid by duration use-cases:<br/>
                - Movie rental by viewing time<br/>
                - Online clairvoyance session<br/>
                - Adult video session<br/>
              </CCardText>
            </CCardBody>
            <CCardFooter>
              <small className="text-medium-emphasis">Eg: sell product subscriptions on my store</small>
            </CCardFooter>
          </CCard>
        </CCol>
        <CCol xs>
          <CCard>
            <CCardBody>
              <CCardTitle>Loyalty card subscriptions</CCardTitle>
              <CCardText>
                Example use-cases: <br/>
                - Free shipping on an order for active members<br/>
                - Free gift on a order for active members<br/>
                - Customers pay loyalty card with tokens
              </CCardText>
            </CCardBody>
            <CCardFooter>
              <small className="text-medium-emphasis">Eg: Amazon Prime paid by cryptocurrency</small>
            </CCardFooter>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
}

export default UseCases