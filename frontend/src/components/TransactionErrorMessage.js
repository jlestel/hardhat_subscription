import React from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import {
  CAlert
} from '@coreui/react'

export function TransactionErrorMessage({}) {
  const transactionError = useSelector((state) => state.transactionError)
  const dispatch = useDispatch()

  return transactionError && (
    <CAlert
    color="danger"
    dismissible
    onClose={() => {
      dispatch({type: 'set', transactionError: null})
    }}>
    {transactionError.message.toString()}
    </CAlert>
  );
}
