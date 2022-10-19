import { CCard, CCardBody, CCardText, CCardTitle, CCol, CRow } from '@coreui/react';
import React from "react";
import { atomOneDark, CopyBlock } from "react-code-blocks";

export function Pricing({ }) {

  return (
    <CRow>
      <h2>Pricing</h2>
      <CCol m>
        <CCard>
          <CCardBody>
            <CCardTitle>We believe innovations doesn&apos;t have to be expensive; </CCardTitle>
            <CCardText>
            that&apos;s why we offer the most competitive prices around without any hidden fees.<br/><br/>
            <ul>
              <li>1% fee per transaction for all plans</li>
              <li>Except for Telegram and Discord subscriptions: 2% fee</li>
            </ul>
            You can use any cryptocurrencies that you can offer your customers to pay you with.<br/>
            If you want to add a missing cryptocurrency when you create Plan form, you just need to send a few token to the owner address:
            </CCardText>
          </CCardBody>
        </CCard>
      </CCol>


    </CRow>
  );
}

export default Pricing