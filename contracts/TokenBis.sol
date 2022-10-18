pragma solidity ^0.8.6;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

// Define the supply of FunToken: 1,000,000 
uint256 constant initialSupply = 5000000 * (10**18);

contract TokenBis is ERC20 {
  
  constructor() ERC20('Payperblock BUSD Token', 'BUSD') {
    _mint(msg.sender, initialSupply);
  }
}
