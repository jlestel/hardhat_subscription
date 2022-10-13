import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { NoWalletDetected } from "../components/NoWalletDetected";
import { ConnectWallet } from "../components/ConnectWallet";
import { Usage } from "../components/Usage";
import { UseCases } from 'src/components/UseCases';

const DefaultLayout = ({  }) => {

  // Ethereum wallets inject the window.ethereum object. If it hasn't been
  // injected, we instruct the user to install MetaMask.
  const eth = window.ethereum
  const address = useSelector((state) => state.selectedAddress)
  
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AppHeader />
        <div className="body flex-grow-1 px-3">
          {eth === undefined && (
            <NoWalletDetected />
            )}
          {eth && !address && (
            <>
            <ConnectWallet />
            <hr/>
            <Usage />
            <hr/>
            <UseCases />
            </>
          )}
          {eth && address && (
          < AppContent />
          )}
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
