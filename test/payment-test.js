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

  beforeEach(async () => {
    const Box = await hre.ethers.getContractFactory("PaymentV1");
    const BoxV2 = await hre.ethers.getContractFactory("PaymentV2");

    const instance = await hre.upgrades.deployProxy(Box, [], {
      initializer: "init",
      kind: "uups"
    });
    payment = await hre.upgrades.upgradeProxy(instance.address, BoxV2);

    const Token = await hre.ethers.getContractFactory("Token");
    token = await Token.deploy(); 
    token.attach(payment.address)
    await token.deployed();

    [merchant, sub, sub2] = await hre.ethers.getSigners();
    await token.transfer(sub.address, 1000);
    await token.connect(sub).approve(payment.address, 100*10, {from: sub.address});
    await token.transfer(sub2.address, 1000);
    await token.connect(sub2).approve(payment.address, 100*10, {from: sub2.address});
  });

  it('init money in mock token', async () => {
    await hre.run('compile');
    //
  });
  it('money should be in mock token', async () => {
    const [owner] = await hre.ethers.getSigners();
    const ownerBalance = await token.balanceOf(owner.address); 
    expect((await token.totalSupply()).toString()).to.equal('1000000000000000000000000');

  });

  it('should create a plan', async () => {
    //console.log("payment deployed to:", payment.address);

    await payment.connect(sub).createPlan(token.address, 100, 30, 0, '1664553005', 'VIP Telegram - Abonnement 1 mois', 'Marchant de rêve', {from: sub.address});
    const plan1 = await payment.plans(0);
//    console.log(plan1)
    expect(plan1.token).to.equal(token.address);
    expect(plan1.amount.toString()).to.equal('100');
    expect(plan1.frequency.toString()).to.equal('30');

    await payment.connect(sub).createPlan(token.address, 200, 60, 2, 'https://www.google.fr', 'VIP Telegram - Abonnement 1 mois', 'Marchant de rêve', {from: sub.address});
    const plan2 = await payment.plans(1);
    expect(plan2.token).to.equal(token.address);
    expect(plan2.amount.toString()).to.equal('200'); 
    expect(plan2.frequency.toString()).to.equal("60"); 
  });

  it('should NOT create a plan', async () => {
    await expect(
      payment.connect(sub).createPlan(constants.ZERO_ADDRESS, 100, 30, 0, '1664553005', 'VIP Telegram - Abonnement 1 mois', 'Marchant de rêve', {from: sub.address})
    ).to.be.revertedWith('NE');
    await expect(
      payment.connect(sub).createPlan(token.address, 0, 30, 0, '1664553005', 'VIP Telegram - Abonnement 1 mois', 'Marchant de rêve', {from: sub.address})
    ).to.be.revertedWith('GT0');
  });

  it('should create a subscription', async () => {
    await payment.connect(sub).createPlan(token.address, 100, 30, 0, '1664553005', 'VIP Telegram - Abonnement 1 mois', 'Marchant de rêve', {from: sub.address});
    //await network.provider.send("evm_mine");
    [deployer, sub] = await ethers.getSigners();
    await network.provider.send("evm_mine");

    //console.log((await token.connect(sub).approve(payment.address, 100*6, {from: sub.address})).value);
    let pay = await payment.connect(sub).isPayable(0, {from: sub.address})
    console.log("is payable: " + pay.toString());
    
    const tx = await payment.connect(sub).subscribe(0, {from: sub.address});
    let block = await tx.wait();
    await network.provider.send("evm_mine");
    
    //const subscriptions = await payment.getSubscriptions(true);
    ////const subscription = subscriptions.filter(e => e.subscriptionId.toString() == block.events[2].args.subscription.subscriptionId.toString())[0]; 
    ////await network.provider.send("evm_mine");
    //block = await hre.ethers.provider.getBlock("latest")
    //const testTime = block.timestamp - 1
    ////await network.provider.send("evm_mine");
    //expect(subscription.subscriber).to.equal(sub.address);
    //expect(subscription.start.toString()).to.equal(testTime.toString());
    //console.log((subscription.nextPayment/10).toFixed(0).toString())
    //expect((subscription.nextPayment/10).toFixed(0).toString()).to.equal(((testTime/ 10).toFixed(0)- + 86400 * 30).toString());
  });

  it('should NOT create a subscription', async () => {
    await expect(
      payment.connect(sub).subscribe(1000, {from: sub.address})
    ).to.be.revertedWith('NE');
  });

  it('should subscribe and pay', async () => {
    let balanceMerchant, balancesub;
    await payment.connect(sub).createPlan(token.address, 100, 30, 0, '1664553005', 'VIP Telegram - Abonnement 1 mois', 'Marchant de rêve', {from: sub.address});

    const tx = await payment.connect(sub2).subscribe(0, {from: sub2.address});
    const block = await tx.wait();
    balanceMerchant = await token.balanceOf(sub.address); 
    balancesub = await token.balanceOf(sub2.address); 
    expect(balanceMerchant.toString()).to.equal('1000');
    expect(balancesub.toString()).to.equal('900');
    
    let tc = await token.connect(merchant).approve(payment.address, 10000000);
    await tc.wait();
    tc = await token.balanceOf(sub.address);
    console.log('balance',tc.toString());
    //await tc.wait();
    tc = await payment.connect(sub).withdrawal(token.address);
    await tc.wait();
    tc = await token.balanceOf(sub.address);
    console.log('balance',tc.toString());

    /*expect(
      payment.connect(sub).pay(0)
    ).to.be.revertedWith('not due yet');*/
      
    /*const ts = await increase(31 * 1000);
    console.log(ts);
    
    await payment.connect(sub2).pay(block.events[2].args.subscription.subscriptionId.toString());
    balanceMerchant = await token.balanceOf(sub.address); 
    balancesub = await token.balanceOf(sub2.address); 
    expect(balanceMerchant.toString()).to.equal('1100');
    expect(balancesub.toString()).to.equal('1000');

    await increase(31 * 1000);

    await payment.connect(sub2).pay(block.events[2].args.subscription.subscriptionId.toString());
    balanceMerchant = await token.balanceOf(sub.address); 
    balancesub = await token.balanceOf(sub2.address); 
    expect(balanceMerchant.toString()).to.equal('1100');
    expect(balancesub.toString()).to.equal('900');*/
  });

  
  it('should subscribe and NOT pay', async () => {
    await payment.createPlan(token.address, 100, 30, 0, '1664553005', 'VIP Telegram - Abonnement 1 mois', 'Marchant de rêve', {from: merchant.address});

    const tx = await payment.connect(sub).subscribe(0, {from: sub.address});
    const block = await tx.wait();
    //await increase(10 * 1000);
    await expect(
      payment.connect(sub).pay(block.events[2].args.subscription.subscriptionId.toString())
    ).to.be.revertedWith('NOT_DUE');
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
    ).to.be.revertedWith('NE');
  });

  it('should NOT cancel subscription', async () => {
    await expect(
      payment.connect(sub).cancel(1000, {from: sub.address})
    ).to.be.revertedWith('NE');

  });
});