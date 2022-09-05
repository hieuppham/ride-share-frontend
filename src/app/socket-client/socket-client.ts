import { io } from 'socket.io-client';
const socket = io();

socket.on('connect', () => {
  console.log(socket.id);
});

socket.on('disconnect', () => {
  console.log(socket.connected);
});
