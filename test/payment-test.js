const { expect } = require("chai");
const hre = require("hardhat");
const { constants } = require('@openzeppelin/test-helpers');
const { checkProperties } = require("ethers/lib/utils");
const { cp, copyFile } = require("fs");
const { ethers } = require("hardhat");
const { increase, advanceBlock } = require("@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time");

describe("Payment", function() {

  //const [admin, merchant, sub.address, _] = addresses;
  let payment, token;
  let merchant, sub;

  it('use last contract upgrade', async () => {
    const Box = await hre.ethers.getContractFactory("PaymentV1");
      const BoxV2 = await hre.ethers.getContractFactory("PaymentV2");
  
      const instance = await hre.upgrades.deployProxy(Box, [], {
        initializer: "init",
      });
      payment = await hre.upgrades.upgradeProxy(instance.address, BoxV2);
  
      const Token = await hre.ethers.getContractFactory("Token");
      token = await Token.deploy(); 
      token.attach(payment.address)
      await token.deployed();
  });
  

  beforeEach(async () => {
    //
  });

  it('init money in mock token', async () => {
    [merchant, sub] = await hre.ethers.getSigners();
    await token.transfer(sub.address, 1200)
    await token.connect(sub).approve(payment.address, 100*12, {from: sub.address});
  });
  it('money should be in mock token', async () => {
    await hre.run('compile');

    const [owner] = await hre.ethers.getSigners();
    const ownerBalance = await token.balanceOf(owner.address);
    //console.log(owner, ownerBalance)
    expect(await token.totalSupply()).to.equal('1000000000000000000000000');

  });

  it('should create a plan', async () => {
    
    //console.log("payment deployed to:", payment.address);

    await payment.createPlan(token.address, 100, 30, 0, '1664553005', 'VIP Telegram - Abonnement 1 mois', 'Marchant de rêve', {from: merchant.address});
    const plan1 = await payment.plans(0);
//    console.log(plan1)
    expect(plan1.token).to.equal(token.address);
    expect(plan1.amount.toString()).to.equal('100');
    expect(plan1.frequency.toString()).to.equal('30');

    await payment.createPlan(token.address, 200, 60, 2, 'https://www.google.fr', 'VIP Telegram - Abonnement 1 mois', 'Marchant de rêve', {from: merchant.address});
    const plan2 = await payment.plans(1);
    expect(plan2.token).to.equal(token.address);
    expect(plan2.amount.toString()).to.equal('200'); 
    expect(plan2.frequency.toString()).to.equal("60"); 
  });

  it('should NOT create a plan', async () => {
    await expect(
      payment.createPlan(constants.ZERO_ADDRESS, 100, 30, 0, '1664553005', 'VIP Telegram - Abonnement 1 mois', 'Marchant de rêve', {from: merchant.address})
    ).to.be.revertedWith('address cannot be null address');
    await expect(
      payment.createPlan(token.address, 0, 30, 0, '1664553005', 'VIP Telegram - Abonnement 1 mois', 'Marchant de rêve', {from: merchant.address})
    ).to.be.revertedWith('amount needs to be > 0');
    await expect(
      payment.createPlan(token.address, 100, 0, 0, '1664553005', 'VIP Telegram - Abonnement 1 mois', 'Marchant de rêve', {from: merchant.address})
    ).to.be.revertedWith('frequency needs to be > 0');
  });

  it('should create a subscription', async () => {
    await payment.createPlan(token.address, 100, 30, 0, '1664553005', 'VIP Telegram - Abonnement 1 mois', 'Marchant de rêve', {from: merchant.address});
    //await network.provider.send("evm_mine");
    [deployer, sub] = await ethers.getSigners();
    await network.provider.send("evm_mine");

    //console.log((await token.connect(sub).approve(payment.address, 100*6, {from: sub.address})).value);
    let pay = await payment.connect(sub).isPayable(0, {from: sub.address})
    console.log("is payable: " + pay.toString());
    
    const tx = await payment.connect(sub).subscribe(0, {from: sub.address});
    let block = await tx.wait();
    await network.provider.send("evm_mine");
    
    const subscription = await payment.subscriptions(sub.address, block.events[2].args.subscription.subscriptionId.toString());
    //await network.provider.send("evm_mine");
    block = await hre.ethers.provider.getBlock("latest")
    const testTime = block.timestamp - 1
    //await network.provider.send("evm_mine");
    expect(subscription.subscriber).to.equal(sub.address);
    expect(subscription.start.toString()).to.equal(testTime.toString());
    //console.log((subscription.nextPayment/10).toFixed(0).toString())
    //expect((subscription.nextPayment/10).toFixed(0).toString()).to.equal(((testTime/ 10).toFixed(0)- + 86400 * 30).toString());
  });

  it('should NOT create a subscription', async () => {
    await expect(
      payment.connect(sub).subscribe(1000, {from: sub.address})
    ).to.be.revertedWith('this plan does not exist');
  });

  it('should subscribe and pay', async () => {
    let balanceMerchant, balancesub;
    await payment.createPlan(token.address, 100, 30, 0, '1664553005', 'VIP Telegram - Abonnement 1 mois', 'Marchant de rêve', {from: merchant.address});

    const tx = await payment.connect(sub).subscribe(0, {from: sub.address});
    const block = await tx.wait();
    balanceMerchant = await token.balanceOf(merchant.address); 
    balancesub = await token.balanceOf(sub.address); 
    expect(balanceMerchant.toString()).to.equal('999999999999999999999000');
    expect(balancesub.toString()).to.equal('1000');

    /*expect(
      payment.connect(sub).pay(0)
    ).to.be.revertedWith('not due yet');*/
      
    const ts = await increase(31 * 1000);
    console.log(ts);
    
    await payment.connect(sub).pay(block.events[2].args.subscription.subscriptionId.toString());
    balanceMerchant = await token.balanceOf(merchant.address); 
    balancesub = await token.balanceOf(sub.address); 
    expect(balanceMerchant.toString()).to.equal('999999999999999999999100');
    expect(balancesub.toString()).to.equal('900');

    await increase(31 * 1000);

    await payment.connect(sub).pay(block.events[2].args.subscription.subscriptionId.toString());
    balanceMerchant = await token.balanceOf(merchant.address); 
    balancesub = await token.balanceOf(sub.address); 
    expect(balanceMerchant.toString()).to.equal('999999999999999999999200');
    expect(balancesub.toString()).to.equal('800');
  });

  
  it('should subscribe and NOT pay', async () => {
    await payment.createPlan(token.address, 100, 30, 0, '1664553005', 'VIP Telegram - Abonnement 1 mois', 'Marchant de rêve', {from: merchant.address});

    const tx = await payment.connect(sub).subscribe(0, {from: sub.address});
    const block = await tx.wait();
    //await increase(10 * 1000);
    await expect(
      payment.connect(sub).pay(block.events[2].args.subscription.subscriptionId.toString())
    ).to.be.revertedWith('not due yet');
  });

  it('should cancel subscription', async () => {
    await payment.createPlan(token.address, 100, 30, 0, '1664553005', 'VIP Telegram - Abonnement 1 mois', 'Marchant de rêve', {from: merchant.address});
    const tx = await payment.connect(sub).subscribe(0, {from: sub.address});
    const block = await tx.wait();
    let subscription1 = await payment.connect(sub).getSubscriptions(true, {from: sub.address});
    await payment.connect(sub).cancel(block.events[2].args.subscription.subscriptionId.toString(), {from: sub.address});
    let subscription2 = await payment.connect(sub).getSubscriptions(true, {from: sub.address});
    expect(subscription2.length).to.equal(subscription1.length-1);
    await expect(
      payment.connect(sub).cancel(block.events[2].args.subscription.subscriptionId.toString(), {from: sub.address})
    ).to.be.revertedWith('this subscription does not exist and cannot be cancelled');
  });

  it('should NOT cancel subscription', async () => {
    await expect(
      payment.connect(sub).cancel(1000, {from: sub.address})
    ).to.be.revertedWith('this subscription does not exist and cannot be cancelled');

  });
});