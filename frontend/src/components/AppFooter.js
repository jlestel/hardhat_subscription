import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter>
      <div>
        <a href="https://payperblock.xyz" target="_blank" rel="noopener noreferrer">
          PayPerBlock
        </a>
        <span className="ms-1">&copy; 2022</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered (without any server) by</span>
        <a href="https://ethereum.org">
          Ethereum Blockchain
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
