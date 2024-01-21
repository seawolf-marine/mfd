import express from 'express';
const http = require('http')

const app = express();
const port = 3000;

let clientIndex = 1000;

app.get('/', (req, res) => {
  console.log('responded with page.')
  res.send('Hello World!');
});

const WebSocket = require('ws')
const server = http.createServer(app)

const wss = new WebSocket.Server({server});

let clients = [];

wss.on('connection', function (client) {
  client.lastUpdated = new Date();
  client.clientIndex = clientIndex++;
  clients.push(client);  
  
  client.on('message', function (data) {  
    client.lastUpdated = new Date();
    console.log('web socket request.' + data);
   });
  console.log('new web socket connection')
})

wss.on('close', function (ws) {
  console.log('web socket has closed.');
  let idx = clients.indexOf(ws);
  clients.splice(idx, 1);
  console.log('web socket connection closed.')
});

wss.on('message', function (data) {
  console.log('web socket request.', data)
});

let idx= 23;

setInterval(() => {
  clients = clients.filter((client) =>
    (new Date().getTime() - client.lastUpdated.getTime()) / 1000 < 5);

  for(let client of clients){
    let delta = (new Date().getTime() - client.lastUpdated.getTime()) / 1000;
    console.log('Client: ' + client.clientIndex + ' delta: ' + delta + ' seconds.');
    client.send('hello ' + idx++ + " " + clients.length)
  }
}, 1000);

server.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
