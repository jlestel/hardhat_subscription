import React from "react";
import { CSpinner, CAlert } from '@coreui/react'
import { useSelector } from "react-redux";

export function WaitingForTransactionMessage({}) {
  const txBeingSent = useSelector((state) => state.txBeingSent)

  return txBeingSent && (
    <CAlert color="primary" dismissible>
      <CSpinner color="primary" size="sm"/>&nbsp;
      Waiting for transaction to be mined...
    </CAlert>
  );
}
