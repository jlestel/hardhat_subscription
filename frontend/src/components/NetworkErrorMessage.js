import React from "react";
import { CSpinner, CAlert } from '@coreui/react'
import { useSelector } from 'react-redux'

export function NetworkErrorMessage({}) {
  const networkError = useSelector((state) => state.networkError)

  return networkError && (
    <CAlert color="danger">
      {networkError}
    </CAlert>
  );
}
