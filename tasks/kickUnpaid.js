const fs = require("fs");

// This file is only here to make interacting with the Dapp easier,
// feel free to ignore it if you don't need it.

//const TelegramBot = require('node-telegram-bot-api');
const { Telegraf } = require('telegraf');
const token = '5614392858:AAGOahPA49QY-4gReT8eHvpvNJs5X_be6BY';

const { TelegramClient, Api } = require('telegram');
const { StringSession } = require("telegram/sessions");

const groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

task("kickUnpaid", "Kick unpaid subscriptions")
  .setAction(async ({}, { ethers }) => {
    if (network.name === "hardhat") {
      console.warn(
        "You are running the faucet task with Hardhat network, which" +
          "gets automatically created and destroyed every time. Use the Hardhat" +
          " option '--network localhost'"
      );
    }

    const addressesFile =
      __dirname + "/../frontend/src/contracts/"+network.name+"/contract-PaymentV1-address.json";

    if (!fs.existsSync(addressesFile)) {
      console.error("You need to deploy your contract first");
      return;
    }

    const addressJson = fs.readFileSync(addressesFile);
    const address = JSON.parse(addressJson);

    if ((await ethers.provider.getCode(address.Token)) === "0x") {
      console.error("You need to deploy your contract first");
      return;
    }

    const payment = await ethers.getContractAt("PaymentV1", address.Token);

    const plans = await payment.getPlans(false);
    //////////////
    // Telegram //
    //////////////
    await telegramBan(payment, plans);
  });

async function telegramBan(payment, plans) {
  const bot = new Telegraf(token);
  const client = new TelegramClient(new StringSession(''), 19085347, '3526abc5dff02a26d49a14b00dc3406a', {});

  // logging in as a bot account
  await client.start({botAuthToken: token});
  const telegramPlans = plans.filter(plan => plan.planType.toString() === '0')
  const telegramChannels = groupBy(telegramPlans, "planTypeInfos" );
  const subscriptions = await payment.getSubscriptions(false);
  const validSubscriptions = subscriptions.filter(e => {
    //console.log(e.subscriptionId, parseInt(e.nextPayment),parseInt(new Date().getTime() / 1000));
    return parseInt(e.nextPayment) >= parseInt(new Date().getTime() / 1000)
  });
  for (const channel in telegramChannels) {
    // Get valid subscription on this Telegram channel 
    const validSubscriptionsOnChannel = validSubscriptions.filter(e => plans[e.planId].planTypeInfos.toString() === channel).map(e => e.subscriberInfos)
    const items =  client.iterParticipants(channel);
    for await (const user of items){
      //console.log("user valid ? ",user.id, ' - ', user.firstName);
      if (
        user.participant
        && user.participant.className
        && ["ChannelParticipantAdmin", "ChannelParticipantCreator"].indexOf(user.participant.className) === -1
      ) {
        if (validSubscriptionsOnChannel.indexOf(user.id.toString()) === -1) {
          let e = await bot.telegram.banChatMember(channel, user.id);
          console.log("Ban ",user.username , '=>', e);
        }
      }
      if (items.index == items.total) break;
    }
  }
  console.log('Complete');
}  