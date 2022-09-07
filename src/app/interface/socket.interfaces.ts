export interface ConnectInfo {
  sessionId: string;
  numberOfConnection: number;
}

export interface SocketMessage {
  id: string;
  data: string;
}
