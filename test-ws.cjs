const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3002');
let msgCount = 0;
ws.on('message', function message(data) {
  console.log('received: %s', data);
  msgCount++;
  if (msgCount >= 2) process.exit(0);
});
