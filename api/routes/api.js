var express = require('express');
const querystring = require('querystring');
var router = express.Router();
const TelegramBot = require('node-telegram-bot-api');
const token = '5614392858:AAGOahPA49QY-4gReT8eHvpvNJs5X_be6BY';
const bot = new TelegramBot(token);

const { TelegramClient, Api } = require('telegram');
const { StringSession } = require("telegram/sessions");
const client = new TelegramClient(new StringSession(''), 19085347, '3526abc5dff02a26d49a14b00dc3406a', {});

const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const REGION = "us-east-1"; //e.g. "us-east-1"
const https = require('https');
const fetch = require('node-fetch');

const hre = require("hardhat");
const fs = require("fs");

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.send('OK');
  res.end();
});
router.get('/refresh', async function(req, res, next) {
  const keySession = req.query.session;
  const time = req.query.time;
  const ddbClient = new DynamoDBClient({ region: REGION });

  const params = {
    TableName: process.env.DDB_TABLE_NAME || 'PayperblockSess',
    Key: {
      sessionKey: { S: keySession },
    },
    ProjectionExpression: "sessionValue",
  };

  let session = null;
  let balance = 0;
  let error = '';
  try {
    console.log('check session ' + keySession);
    const data = await ddbClient.send(new GetItemCommand(params));
    console.log(data);
    if (data && data.Item) {
      console.log("Success", data.Item.sessionValue.S);
      session = JSON.parse(data.Item.sessionValue.S);

      const network = process.env.HARDHAT_NETWORK;
      const contract = "PaymentV1";
      
      const addressesFile = __dirname + "/../contracts/"+network+"/contract-"+contract+"-address.json";
      if (!fs.existsSync(addressesFile)) {
        console.error("You need to deploy your contract first");
        return;
      }
      const addressJson = fs.readFileSync(addressesFile);
      const address = JSON.parse(addressJson);
      console.log(address.Token);

      const payment = await hre.ethers.getContractAt(contract, address.Token);
      //const instance = await payment.deployed();
      balance = await payment.balance(session.subscriptionId.toString());
      
      if (session && session.type && session.type.toString() == '3') {
        if (!session.duration)
          session.duration = 0;

        session.duration = parseInt(session.duration) + parseInt(time);
        // if session duration > plan.frequency : need to pay
        console.log((session.duration / 1000),'>',session.frequency,'?');
        if ((session.duration / 1000) >= session.frequency) {
        //if (session.duration >= session.frequency) {
          // Pay now by duration :)
          console.log("Renew ...")
          const isPayable = await payment.isRenewable(session.subscriptionId.toString());
          if (isPayable) {
            // TODO: here I don't wait ... need to check payment is done, else end session.
            payment.pay(session.subscriptionId.toString(), { gasLimit: 150000});
            //const tx = await payment.pay(session.subscriptionId.toString(), { gasLimit: 150000});
            //const receipt = await tx.wait();
            //balance = await payment.balance(session.subscriptionId.toString());
            console.log("Renewed !");
            session.duration = 0;
          } else {
            error = 'Insufficient allowance. You need to add fund to your wallet to access again.';
            session = null;
            session.duration = 0;
          }
        }

        const paramsUpdate = {
          TableName: process.env.DDB_TABLE_NAME || 'PayperblockSess',
          Key: {
            sessionKey: { S: keySession },
          },
          UpdateExpression: "set sessionValue = :s", 
          ExpressionAttributeValues: {
            ":s": { S: JSON.stringify(session) },
          },
          ReturnValues: "UPDATED_NEW"
        };
        const dataUpdate = await ddbClient.send(new UpdateItemCommand(paramsUpdate));
        console.log(dataUpdate);
        // duration frequency subscriptionId
      }
    } else {
      session = null;
    }
  } catch (e) {
    if (e.message.indexOf('NOT_DUE') === -1) {
      console.log(e.message);
      error = e.message;
      session = null;
    } else {
      console.log('not due !');
    }
  }
  //TODO : increment
  res.json({valid: (session != null), periodPaid: true, balance: balance.toString(), message: error});
  res.end();
});

router.get('/test', async function(req, clientResponse, next) {
  try {
    fetch('https://github.com/')
      .then(res => res.text())
      .then(body => {
        console.log(body);
        clientResponse.send(body);
        clientResponse.end();
      });

  } catch (error) {
    console.log(error);
    //res.json({body: JSON.stringify({error})});
    clientResponse.send('Error')
    clientResponse.end();
  }
});

const writeSession = async(key, value) => {
  console.log(process.env.DDB_TABLE_NAME);
  const ddbClient = new DynamoDBClient({ region: REGION });
  try {
    // Set the parameters
    const params = {
      TableName: process.env.DDB_TABLE_NAME || 'PayperblockSess',
      Item: {
        sessionKey: { S: key },
        sessionValue: { S: JSON.stringify(value) },
      },
    };
    const data = await ddbClient.send(new PutItemCommand(params));
    console.log(data);
  } catch (err) {
    console.error(err);
  }
};

router.post('/validPlan', async function(req, res, next) {
  const planType = req.body.planType.toString();
  const planTypeInfos = req.body.planTypeInfos;
  try {
    switch(planType) {
      case '0':
        const updates = await bot.getUpdates();
        const lastUpdate = updates.filter(e => e.my_chat_member && e.my_chat_member.new_chat_member && e.my_chat_member.new_chat_member.user.username == 'subscriptions_by_bot');
        if (lastUpdate.length > 0) {
          // Get channel ID
          //lastUpdate[lastUpdate.length - 1].my_chat_member.chat
          await bot.getChatAdministrators(lastUpdate[lastUpdate.length - 1].my_chat_member.chat.id);
          res.json({valid: true, telegramChannel: lastUpdate[lastUpdate.length - 1].my_chat_member.chat.title, value: lastUpdate[lastUpdate.length - 1].my_chat_member.chat.id.toString()});
        } else {
          res.json({valid: false, error: 'Please add our bot as admin of your Channel.'});
        }
        break;
      case '1':
        res.json({valid: false, error: 'Not implemented (Work in progress)'});
        break;
      case '2':
      case '3':
        // Http by Duration
        const response = await fetch(planTypeInfos);
        console.log("response.status ",response.status);
        if (response.status == 200) {
          res.json({valid: true, url: planTypeInfos});
        } else {
          res.json({valid: false, error: 'Invalid response status: ' + response.status});
        }
        break;
    }
  } catch (e) {
    res.json({valid: false, error: e.message});
  }
  res.end();
});

router.post('/validSubscription', async function(req, res, next) {
  console.log(req.body);
  //const receipt = req.body.receipt;

  //const planType = parseInt(receipt.events[2].args[2].hex);
  //const planTypeInfos = receipt.events[2].args[3].toString();
  //const subscriberAddress = receipt.events[2].args[0].toString();

  const subscriptionId = req.body.subscriptionId.toString();
  const planId = req.body.planId.toString();
  const token = req.body.token.toString();
  const planType = req.body.planType.toString();
  const frequency = req.body.frequency.toString();
  const planTypeInfos = req.body.planTypeInfos;
  const subscriber = req.body.subscriber;
  const subscriberInfos = req.body.subscriberInfos;
  const plan = req.body.plan;
  const sessionId = parseInt(Math.random() * 10000000000000000).toString(); //req.body.sessionId || '1234';
  const playerUrl = req.body.playerUrl.replace('{{session}}', sessionId);

  const network = process.env.HARDHAT_NETWORK;
  const contract = "PaymentV1";
  
  const addressesFile = __dirname + "/../contracts/"+network+"/contract-"+contract+"-address.json";
  if (!fs.existsSync(addressesFile)) {
    console.error("You need to deploy your contract first");
    return;
  }
  const addressJson = fs.readFileSync(addressesFile);
  const address = JSON.parse(addressJson);
  console.log(address.Token);

  const payment = await hre.ethers.getContractAt(contract, address.Token);
  const instance = await payment.deployed();
  const subs = await payment.getSubscriptions(false);
  const isPayable = await payment.isRenewable(subscriptionId.toString());

  console.log("planType ", planType);
  console.log("planTypeInfos ", planTypeInfos.toString());  
  //console.log("subscriberAddress ", subscriberAddress.toString());
  const session = {
    type: planType, 
    subscription: plan, 
    targetUrl: planTypeInfos.toString(), 
    duration: 0, 
    frequency: parseInt(frequency), 
    subscriptionId: subscriptionId.toString(),
    subscriber: subscriber.toString(),
    planId: planId.toString(),
    token: token.toString(),
  };
  switch(planType) {
    case '0':
      // Telegram
      date = new Date();
      date.setMonth(date.getMonth() + 12);
      try {
        bot.unbanChatMember(planTypeInfos, subscriberInfos);
        const result = await bot.createChatInviteLink(planTypeInfos, session);
        session.targetUrl = result.invite_link;
        res.json({type: planType, link: result.invite_link});
      } catch (e){
        res.json({error: e.message});
      }
      res.end();
      break;
    case '1':
        // Discord
        // TODO
    case '2':
      // Http
    case '3':
      // Http by Duration
      await writeSession(sessionId, session);
      res.json({type: planType, link: playerUrl});
      res.end();
      break;
    default:
      console.log("no plan type");
      break;
  }
});

module.exports = router;
