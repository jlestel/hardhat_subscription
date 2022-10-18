import React from "react";
import { useSelector, useDispatch } from 'react-redux'

import {
    CAlert,
    CAlertHeading,
  } from '@coreui/react'

export function SubscriptionResult({}) {
  const dispatch = useDispatch();
    const responseToSubscribe = useSelector((state) => state.responseToSubscribe)

    const handleClose = () => {
      dispatch({ type: 'set', responseToSubscribe: null });
    }

    return (
        <>
        {responseToSubscribe && responseToSubscribe.error && (
          <CAlert color="danger" dismissible onClose={handleClose}>
            <CAlertHeading tag="h4">{responseToSubscribe.error}</CAlertHeading>
          </CAlert>
        )}
        {responseToSubscribe && !responseToSubscribe.error && responseToSubscribe.type.toString() !== '' && (
        <CAlert color="success" dismissible onClose={handleClose}>
        <CAlertHeading tag="h4">
        {responseToSubscribe && !responseToSubscribe.error && responseToSubscribe.type.toString() === '0' && (
            <>Your link to join Telegram channel : <a href={responseToSubscribe.link} target="_blank" rel="noopener noreferrer">{responseToSubscribe.link}</a></>
          )}
          {responseToSubscribe && !responseToSubscribe.error && responseToSubscribe.type.toString() === '1' && (
            <>Your link to access Discord content : <a href={responseToSubscribe.link} target="_blank" rel="noopener noreferrer">{responseToSubscribe.link}</a></>
          )}
          {(responseToSubscribe && !responseToSubscribe.error && (responseToSubscribe.type.toString() === '3' || responseToSubscribe.type.toString() === '2'))&& (
            <>Your link to access Web content : <a href={responseToSubscribe.link + "/playerppb/"} target="_blank" rel="noopener noreferrer">{responseToSubscribe.link}</a></>
          )}
        </CAlertHeading>
        <p className="mb-0">Manage your subscriptions and access again <a href="/#/subscription/list" target="_blank" rel="noopener noreferrer">here</a>.</p>
        </CAlert>
        )}
        </>
    );
  }
  
  export default SubscriptionResult