import { CCard, CCardBody, CCardTitle, CCol, CRow, CCardText } from "@coreui/react";
import React from "react";

export function NoWalletDetected() {
  return (
    <div className="container">
      
    <CRow>
      <CCol m>
        <CCard>
          <CCardBody className="text-center">
            <CCardTitle><h2>No wallet detected :(</h2>... but you can install Metamask as a browser extension to create your wallet and connect!</CCardTitle>
            <CCardText>
             <br />
            <h3>Please {" "}
            <a
              href="http://metamask.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              install MetaMask now
            </a> to receive your Web3 payments :)
            </h3>
            </CCardText>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
    </div>
  );
}
