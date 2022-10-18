var express = require('express');
const https = require('https');
const http = require('http');
const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const REGION = "us-east-1"; //e.g. "us-east-1"

/* GET home page. */
/*router.get('/', async function(req, res, next) {
  res.send('OK');
  res.end();
});
*/
//const targetUrl = process.env.TARGET_URL || ; // Run localtunnel like `lt -s rscraper -p 8080 --print-requests`; then visit https://yourname.loca.lt/todos/1 .
async function proxyRequest(clientRequest, clientResponse) {
  const keySession = clientRequest.hostname.split('.')[0];
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
      session = JSON.parse(data.Item.sessionValue.S)
    }

    const targetUrl = session ? session.targetUrl : 'https://randomuser.me/';
    const parsedHost = targetUrl.split('/').splice(2).splice(0, 1).join('/');
    let parsedPort;
    let parsedSSL;
    if (targetUrl.startsWith('https://')) {
      parsedPort = 443;
      parsedSSL = https;
    } else if (targetUrl.startsWith('http://')) {
      parsedPort = 80;
      parsedSSL = http;
    }
    console.log(clientRequest.method, 'on', clientRequest.url)
    const options = {
      hostname: parsedHost,
      port: parsedPort,
      path: clientRequest.url,
      method: clientRequest.method,
      headers: {
        'User-Agent': clientRequest.headers['user-agent'],
        'host': parsedHost,
        'referer': targetUrl
        //'remote-address': clientRequest.headers['x-forwarded-for'] || clientRequest.connection.remoteAddress
      },
    };

    const serverRequest = parsedSSL.request(options, function (serverResponse) {
      let body = '';
      if (String(serverResponse.headers['content-type']).indexOf('text/html') !== -1) {
        serverResponse.on('data', function (chunk) {
          body += chunk;
        });
        serverResponse.on('end', function () {
          // Make changes to HTML files when they're done being read.
          const plan = session ? session.subscription : 'Pas de session';
          body = body.replace('</body>', '<div style=" background: #84baff; line-height: 2; text-align: center; color: #FFFF; font-size: 30px; font-family: sans-serif; font-weight: bold; text-shadow: 0 1px 0 #84BAFF; box-shadow: 0 0 15px #00214B; position: fixed; bottom: 0px;width: 100%;">'+
          plan
          +' - <a href="http://localhost:3000/">Close</a></div>');
  
          console.log(serverResponse.statusCode, serverResponse.headers);
          clientResponse.writeHead(serverResponse.statusCode, serverResponse.headers);
          clientResponse.end(body);
        });
        serverResponse.on('error', function (e) {
          console.log('serverReponse error', e)
          clientResponse.writeHead(serverResponse.statusCode, serverResponse.headers);
          clientResponse.end('');
        });
      } else {
        serverResponse.pipe(clientResponse, {
          end: true,
        });
        clientResponse.contentType(serverResponse.headers['content-type']);
      }
    });
    serverRequest.end();
  } catch (e) {
    console.log('Error ', e);
  }

};


module.exports = proxyRequest;
