pragma solidity ^0.8.6;

import "./Payment.sol";

contract PaymentV1 is PaymentV0 {
    function init() public virtual initializer {
        PaymentV0.initialize(); // Do not forget this call!
    }

    function getContractVersion() public virtual view returns (uint256) {
      return 1;
    }
}
// not yet used
contract PaymentV2 is PaymentV1 {
    function init() public override initializer {
        PaymentV1.init(); // Do not forget this call!
    }

    function getContractVersion() public override pure returns (uint256) {
      return 2;
    }
}