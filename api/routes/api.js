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

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.send('OK');
  res.end();
});
router.get('/validSubscription', async function(req, res, next) {
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
  try {
    console.log('check session ' + keySession);
    const data = await ddbClient.send(new GetItemCommand(params));
    console.log(data);
    if (data && data.Item) {
      console.log("Success", data.Item.sessionValue.S);
      session = JSON.parse(data.Item.sessionValue.S);
      if (session && session.planType && session.planType.toString() == '3') {
        if (!session.duration)
          session.duration = 0;

        session.duration = parseInt(session.duration) + parseInt(time);
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
    }
  } catch (e) {
    console.log(e);
  }
  //TODO : increment
  res.json({valid: (session != null), periodPaid: true});
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
  const planType = req.body.planType.toString();
  const frequency = req.body.frequency.toString();
  const planTypeInfos = req.body.planTypeInfos;
  const subscriber = req.body.subscriber;
  const subscriberInfos = req.body.subscriberInfos;
  const plan = req.body.plan;
  const sessionId = parseInt(Math.random() * 10000000000000000).toString(); //req.body.sessionId || '1234';
  const playerUrl = req.body.playerUrl.replace('{{session}}', sessionId);

  console.log("planType ", planType);
  console.log("planTypeInfos ", planTypeInfos.toString());  
  //console.log("subscriberAddress ", subscriberAddress.toString());

  switch(planType) {
    case '0':
      // Telegram
      date = new Date();
      date.setMonth(date.getMonth() + 12);
      try {
        bot.unbanChatMember(planTypeInfos, subscriberInfos);
        const result = await bot.createChatInviteLink(planTypeInfos, {name: "Invitation from subscription of " + subscriber.toString()}, date.getTime(), 1)
        console.log(result);
        await writeSession(sessionId, {type: planType, subscription: plan, targetUrl: result.invite_link, duration: 0, frequency: parseInt(frequency), subscriptionId: subscriptionId.toString()});
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
      await writeSession(sessionId, {type: planType, subscription: plan, targetUrl: planTypeInfos.toString(), duration: 0, frequency: parseInt(frequency), subscriptionId: subscriptionId.toString()});
      res.json({type: planType, link: playerUrl});
      res.end();
      break;
    default:
      console.log("no plan type");
      break;
  }
});

module.exports = router;
