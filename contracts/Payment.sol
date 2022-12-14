pragma solidity ^0.8.6;

//import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "hardhat/console.sol";

contract PaymentV0 is Initializable, OwnableUpgradeable, UUPSUpgradeable {

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
        uint paid;
        uint released;
    }
    struct Subscription {
        uint subscriptionId;
        uint planId;
        address subscriber;
        string subscriberInfos;
        uint start;
        uint nextPayment;
        uint paid;
    }

    uint public nextPlanId;
    uint public nextSubscriptionId;

    mapping(uint => Plan) public plans;

    //mapping(address => mapping(uint => Subscription)) public subscriptions;
    mapping(uint => Subscription) private _allSubscriptions;

    event SubscriptionCreated(
        address subscriber,
        Plan plan,
        Subscription subscription,
        uint date
    );
    uint256[48] __gap;

    function initialize() public initializer {
        __PaymentV0_init();
        nextSubscriptionId = 0;
        nextPlanId = 0;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function __PaymentV0_init() internal initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    function __PaymentV0_init_unchained() internal initializer {
        __Ownable_init_unchained();
        __UUPSUpgradeable_init_unchained();
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    /*constructor() {
      _disableInitializers();
  }*/
    /*constructor() payable {

  }*/

    function createPlan(
        address token,
        uint amount,
        uint frequency,
        uint8 planType,
        string memory planTypeInfos,
        string memory planName,
        string memory merchantName
    ) external {
        require(token != address(0), "NE");
        require(amount > 0, "GT0");
        plans[nextPlanId] = Plan(
            msg.sender,
            token,
            nextPlanId,
            amount,
            frequency,
            planType,
            planTypeInfos,
            planName,
            merchantName,
            0,
            0
        );
        nextPlanId++;
    }

    function subscribe(uint planId, string memory customData) external {
        IERC20 token = IERC20(plans[planId].token);
        Plan storage plan = plans[planId];
        require(plan.merchant != address(0), "NE");
        require(token.allowance(msg.sender, address(this)) > plan.amount, "NA");

        token.transferFrom(msg.sender, this.owner(), plan.amount);

        Subscription memory sub = Subscription(
            nextSubscriptionId,
            plan.planId,
            msg.sender,
            customData,
            block.timestamp,
            block.timestamp + plan.frequency,
            plan.amount
        );
        plan.paid += plan.amount;
        //subscriptions[msg.sender][nextSubscriptionId] = sub;
        _allSubscriptions[nextSubscriptionId] = sub;
        emit SubscriptionCreated(msg.sender, plan, sub, block.timestamp);
        nextSubscriptionId++;
    }

    function cancel(uint subscriptionId) external {
        Subscription storage subscription = _allSubscriptions[
            subscriptionId
        ];
        require(subscription.subscriber != address(0), "NE");
        uint length = 0;
        for (uint i = 0; i <= nextSubscriptionId; i++) {
            if (_allSubscriptions[i].subscriber == msg.sender) {
                length += 1;
            }
        }
        //delete subscriptions[msg.sender][subscriptionId];
        delete _allSubscriptions[subscriptionId];
    }

    function pay(uint subscriptionId) external {
        Subscription storage subscription = _allSubscriptions[subscriptionId];
        require(subscription.subscriber != address(0), "NE");
        require(block.timestamp > subscription.nextPayment, "NOT_DUE");
        Plan storage plan = plans[subscription.planId];
        IERC20(plan.token).transferFrom(
            subscription.subscriber,
            this.owner(),
            plan.amount
        );
        subscription.nextPayment = subscription.nextPayment + plan.frequency;
        subscription.paid += plan.amount;
        plan.paid += plan.amount; 
    }

    function withdrawal(address tokenAddress) external {
        IERC20 token = IERC20(tokenAddress);
        require(msg.sender != address(0), "NE");
        require(token.allowance(this.owner(), address(this)) > 0, "NA");
        uint withdraw = 0;
        // Get already released amount
        for (uint256 index = 0; index <= nextPlanId; index++) {
            if (
                plans[index].merchant == msg.sender && 
                plans[index].token == tokenAddress &&
                plans[index].paid > plans[index].released
                ) {
                Plan storage plan = plans[index];
                withdraw += (plan.paid - plan.released);
                plan.released = plan.paid;
            }
        }
        console.log('release %s', withdraw);
        if (withdraw > 0) {
            token.transferFrom(this.owner(), msg.sender, withdraw * 98 / 100);
        }
    }

    function getPlans(bool onlyMine) public view returns (Plan[] memory) {
        uint length = 0;
        for (uint i = 0; i <= nextPlanId; i++) {
            if (onlyMine) {
                if (plans[i].merchant == msg.sender) {
                    length += 1;
                }
            } else {
                if (plans[i].merchant != address(0)) {
                    length += 1;
                }
            }
        }
        Plan[] memory myMessages = new Plan[](length);
        uint y = 0;
        for (uint256 index = 0; index < nextPlanId; index++) {
            if (plans[index].merchant != address(0)) {
                if (
                    !onlyMine ||
                    (onlyMine && plans[index].merchant == msg.sender)
                ) {
                    myMessages[y] = plans[index];
                    y += 1;
                }
            }
        }
        return myMessages;
    }

    function getSubscriptions(bool onlyMine)
        public
        view
        returns (Subscription[] memory)
    {
        uint length = 0;
        for (uint i = 0; i <= nextSubscriptionId; i++) {
            if (onlyMine) {
                if (_allSubscriptions[i].subscriber == msg.sender) {
                    length += 1;
                }
            } else {
                if (_allSubscriptions[i].subscriber != address(0)) {
                    length += 1;
                }
            }
        }
        Subscription[] memory mySubscriptions = new Subscription[](length);
        uint y = 0;
        for (uint256 index = 0; index < nextSubscriptionId; index++) {
            if (_allSubscriptions[index].subscriber != address(0)) {
                if (
                    !onlyMine ||
                    (onlyMine &&
                        _allSubscriptions[index].subscriber == msg.sender)
                ) {
                    mySubscriptions[y] = _allSubscriptions[index];
                    y += 1;
                }
            }
        }
        return mySubscriptions;
    }

    function isPayable(uint planId) public view returns (bool success) {
        require(plans[planId].merchant != address(0), "NE");
        return
            IERC20(plans[planId].token).allowance(msg.sender, address(this)) >=
            plans[planId].amount &&
            IERC20(plans[planId].token).balanceOf(msg.sender) >=
            plans[planId].amount;
    }

    function allowance(uint planId) public view returns (uint success) {
        require(plans[planId].merchant != address(0), "NE");
        return IERC20(plans[planId].token).allowance(msg.sender, address(this));
    }

    function isRenewable(uint subscriptionId) public view returns (bool success) {
        require(
            _allSubscriptions[subscriptionId].subscriber != address(0),
            "NE"
        );
        require(plans[_allSubscriptions[subscriptionId].planId].merchant != address(0), "NE");
        require(IERC20(plans[_allSubscriptions[subscriptionId].planId].token).allowance(_allSubscriptions[subscriptionId].subscriber, address(this)) >
            plans[_allSubscriptions[subscriptionId].planId].amount, "AMOUNT_NOT_ALLOWED");
        require(IERC20(plans[_allSubscriptions[subscriptionId].planId].token).balanceOf(_allSubscriptions[subscriptionId].subscriber) >
            plans[_allSubscriptions[subscriptionId].planId].amount, "AMOUNT_NIN_BALANCE");
        return
            IERC20(plans[_allSubscriptions[subscriptionId].planId].token).allowance(_allSubscriptions[subscriptionId].subscriber, address(this)) >
            plans[_allSubscriptions[subscriptionId].planId].amount &&
            IERC20(plans[_allSubscriptions[subscriptionId].planId].token).balanceOf(_allSubscriptions[subscriptionId].subscriber) >
            plans[_allSubscriptions[subscriptionId].planId].amount;
    }

    // TODO: remove
    function balance(uint subscriptionId) public view returns (uint success) {
        require(
            _allSubscriptions[subscriptionId].subscriber != address(0),
            "NE"
        );
        return
            IERC20(plans[_allSubscriptions[subscriptionId].planId].token)
                .balanceOf(_allSubscriptions[subscriptionId].subscriber);
    }
}
