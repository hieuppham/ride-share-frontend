import io from 'socket.io-client';

export const socketClient: SocketIOClient.Socket = io(
  'ws://localhost:9092/ride-share',
  {
    autoConnect: false,
  }
);
