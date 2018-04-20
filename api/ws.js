const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const uuidv4 = require('uuid/v4');
const moment = require('moment');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


function randomOutage() {
  var now = moment();
  var startTime = moment().add(Math.floor(Math.random() * 365), 'd');
  var endTime = moment(startTime).add(Math.floor(Math.random() * 30), 'd');
  return {
    uuid: uuidv4(),
    power_plant: "Somewhere...",
    startTime,
    endTime
  }
}

wss.on('connection', function connection(ws, req) {
  var timer = setInterval(() => {
    var outage = randomOutage();
    console.log(`About to emit outage => ${JSON.stringify(outage)}`);
    ws.send(JSON.stringify(outage))
  }, 1000);
  ws.on('close', function close() {
    clearInterval(timer);
  });
});

server.listen(8080, function listening() {
  console.log(`Websocket app listening on ${server.address().port}`);
});
