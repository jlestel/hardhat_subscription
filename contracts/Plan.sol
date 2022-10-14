pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
//import "hardhat/console.sol";

abstract contract PlanV0 is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    uint public nextPlanId;

    struct Plan {
        address merchant;
        address token;
        uint planId;
        uint amount;
        uint frequency;
        uint8 planType;
        string planTypeInfos;
        string planName;
        string merchantName;
    }

    mapping(uint => Plan) public plans;
    uint256[48] __gap;

    function initialize() public initializer {
        __PlanV0_init();
        nextPlanId = 5;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function __PlanV0_init() internal initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    function __PlanV0_init_unchained() internal initializer {
        __Ownable_init_unchained();
        __UUPSUpgradeable_init_unchained();
    }

    function createPlan(
        address token,
        uint amount,
        uint frequency,
        uint8 planType,
        string memory planTypeInfos,
        string memory planName,
        string memory merchantName
    ) external {
        require(token != address(0), "address cannot be null address");
        require(amount > 0, "amount needs to be > 0");
        require(frequency > 0, "frequency needs to be > 0");
        plans[nextPlanId] = Plan(
            msg.sender,
            token,
            nextPlanId,
            amount,
            frequency,
            planType,
            planTypeInfos,
            planName,
            merchantName
        );
        nextPlanId++;
    }

    function getPlans(bool onlyMine) public view returns (Plan[] memory) {
        uint256 length = nextPlanId;
        require(length > 0, "aucun plan");
        Plan[] memory myMessages = new Plan[](length);
        for (uint256 index = 0; index < length; index++) {
            if (plans[index].merchant != address(0)) {
              if (!onlyMine || (onlyMine && plans[index].merchant == msg.sender)) {
                myMessages[index] = plans[index];
              }
            }
        }
        return myMessages;
    }

    function isPayable(uint planId) public view returns (bool success) {
        IERC20 token = IERC20(plans[planId].token);
        Plan storage plan = plans[planId];
        require(plan.merchant != address(0), "this plan does not exist");
        return
            token.allowance(msg.sender, address(this)) > plan.amount &&
            token.balanceOf(msg.sender) > plan.amount;
    }

    function allowance(uint planId) public view returns (uint success) {
        IERC20 token = IERC20(plans[planId].token);
        Plan storage plan = plans[planId];
        require(plan.merchant != address(0), "this plan does not exist");
        return token.allowance(msg.sender, address(this));
    }
}
