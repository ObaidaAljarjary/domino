import { Peer, DataConnection } from 'peerjs';

export interface RoomMessage {
  type:
    | 'JOIN_ROOM'
    | 'GAME_STATE_SYNC'
    | 'PLAY_TILE_ACTION'
    | 'DRAW_TILE_ACTION'
    | 'PASS_TURN_ACTION'
    | 'CHAT_MESSAGE'
    | 'PLAYER_READY';
  payload: any;
  senderId: string;
  senderName?: string;
}

const STUN_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
};

export class MultiplayerRoomManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private hostConnection: DataConnection | null = null;
  private channel: BroadcastChannel | null = null;
  public myPeerId: string = '';
  public isHost: boolean = false;
  public roomCode: string = '';
  public onMessageCallback: ((msg: RoomMessage) => void) | null = null;
  public onConnectedCallback: (() => void) | null = null;
  public onErrorCallback: ((err: string) => void) | null = null;

  constructor() {
    try {
      this.channel = new BroadcastChannel('iraqi_domino_room_channel');
      this.channel.onmessage = (event) => {
        if (this.onMessageCallback) {
          this.onMessageCallback(event.data);
        }
      };
    } catch {
      // BroadcastChannel fallback
    }
  }

  // Host creates Room Code
  public createRoom(
    code: string,
    onReady: (roomCode: string, peerId: string) => void,
    onError: (err: string) => void
  ) {
    this.isHost = true;
    this.roomCode = code.toUpperCase().trim();
    const fullRoomId = `iraqi-domino-room-${this.roomCode}`;

    this.destroyPeer();

    this.peer = new Peer(fullRoomId, {
      config: STUN_CONFIG,
      debug: 1,
    });

    this.peer.on('open', (id) => {
      this.myPeerId = id;
      onReady(this.roomCode, id);
    });

    this.peer.on('connection', (conn) => {
      this.connections.set(conn.peer, conn);

      conn.on('open', () => {
        if (this.onConnectedCallback) this.onConnectedCallback();
      });

      conn.on('data', (data: any) => {
        if (this.onMessageCallback) {
          this.onMessageCallback(data as RoomMessage);
        }
      });

      conn.on('close', () => {
        this.connections.delete(conn.peer);
      });
    });

    this.peer.on('error', (err) => {
      console.warn('PeerJS Host Error:', err);
      if (err.type === 'unavailable-id') {
        onError('Room code already in use. Please try another code.');
      } else {
        onError(`Room creation error: ${err.type}`);
      }
    });
  }

  // Guest joins Room Code
  public joinRoom(
    code: string,
    onConnected: () => void,
    onError: (err: string) => void
  ) {
    this.isHost = false;
    this.roomCode = code.toUpperCase().trim();
    const hostRoomId = `iraqi-domino-room-${this.roomCode}`;
    this.myPeerId = `guest-${Math.random().toString(36).substring(2, 8)}`;

    this.destroyPeer();

    this.peer = new Peer(this.myPeerId, {
      config: STUN_CONFIG,
      debug: 1,
    });

    this.peer.on('open', () => {
      if (!this.peer) return;
      const conn = this.peer.connect(hostRoomId);
      this.hostConnection = conn;

      conn.on('open', () => {
        onConnected();
      });

      conn.on('data', (data: any) => {
        if (this.onMessageCallback) {
          this.onMessageCallback(data as RoomMessage);
        }
      });

      conn.on('error', (err) => {
        console.warn('PeerJS Connection Error:', err);
        onError('Could not connect to host. Make sure host is active.');
      });
    });

    this.peer.on('error', (err) => {
      console.warn('PeerJS Peer Error:', err);
      onError('Room not found or host unreachable.');
    });
  }

  // Send message
  public broadcastMessage(type: RoomMessage['type'], payload: any, senderName?: string) {
    const message: RoomMessage = {
      type,
      payload,
      senderId: this.myPeerId,
      senderName,
    };

    // Broadcast channel for local testing across tabs
    if (this.channel) {
      this.channel.postMessage(message);
    }

    // PeerJS webRTC broadcast
    if (this.isHost) {
      this.connections.forEach((conn) => {
        if (conn.open) {
          conn.send(message);
        }
      });
    } else if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(message);
    }
  }

  private destroyPeer() {
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {
        // ignore
      }
      this.peer = null;
    }
  }

  public destroy() {
    if (this.channel) {
      this.channel.close();
    }
    this.destroyPeer();
  }
}
