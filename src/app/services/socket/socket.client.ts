import * as net from 'net';
import * as readline from 'readline';

const readLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const socket: net.Socket = net.createConnection(3333, 'localhost', () => {
  console.log('Connected to server');
});

socket.on('data', (data) => {
  console.log('SERVER: ' + data);
  readLine.question('CLIENT: ', (answer) => {
    socket.write(answer);
  });
});
