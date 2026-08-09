import { Peer, type DataConnection } from 'peerjs';

export interface RoomMessage {
  type:
    | 'JOIN_ROOM'
    | 'GAME_STATE_SYNC'
    | 'PLAY_TILE_ACTION'
    | 'DRAW_TILE_ACTION'
    | 'PASS_TURN_ACTION'
    | 'START_GAME';
  payload: any;
  senderId: string;
  senderName?: string;
}

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

export class MultiplayerRoomManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private hostConnection: DataConnection | null = null;
  private channel: BroadcastChannel | null = null;
  private wsFallback: WebSocket | null = null;

  public myPeerId: string = '';
  public isHost: boolean = false;
  public roomCode: string = '';
  public onMessageCallback: ((msg: RoomMessage) => void) | null = null;
  public onStatusCallback: ((status: string) => void) | null = null;

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

  // Create Room as Host
  public createRoom(
    code: string,
    onReady: (roomCode: string, peerId: string) => void,
    onError: (err: string) => void
  ) {
    this.isHost = true;
    this.roomCode = code.toUpperCase().trim();
    const fullRoomId = `iraqi-domino-${this.roomCode}`;

    this.destroyPeer();
    this.myPeerId = `host-${Math.random().toString(36).substring(2, 8)}`;

    if (this.onStatusCallback) {
      this.onStatusCallback('جارِ إنشاء الغرفة الأونلاين...');
    }

    try {
      this.peer = new Peer(fullRoomId, {
        config: STUN_SERVERS,
        debug: 1,
      });

      this.peer.on('open', (id) => {
        this.myPeerId = id;
        if (this.onStatusCallback) {
          this.onStatusCallback('تم إنشاء الغرفة بنجاح! بانتظار انضمام صديقك...');
        }
        onReady(this.roomCode, id);
      });

      this.peer.on('connection', (conn) => {
        this.connections.set(conn.peer, conn);

        conn.on('open', () => {
          if (this.onStatusCallback) {
            this.onStatusCallback('انضم صديقك للغرفة بنجاح!');
          }
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
        console.warn('PeerJS Host Warning:', err);
        if (err.type === 'unavailable-id') {
          this.fallbackPeerSetup(fullRoomId, onReady, onError);
        } else {
          this.setupRelayFallback(this.roomCode);
          onReady(this.roomCode, this.myPeerId);
        }
      });
    } catch {
      this.setupRelayFallback(this.roomCode);
      onReady(this.roomCode, this.myPeerId);
    }
  }

  // Join Room as Guest
  public joinRoom(
    code: string,
    onConnected: () => void,
    _onError: (err: string) => void
  ) {
    this.isHost = false;
    this.roomCode = code.toUpperCase().trim();
    const hostRoomId = `iraqi-domino-${this.roomCode}`;
    this.myPeerId = `guest-${Math.random().toString(36).substring(2, 8)}`;

    this.destroyPeer();

    if (this.onStatusCallback) {
      this.onStatusCallback('جارِ الاتصال بغرفة صديقك...');
    }

    try {
      this.peer = new Peer(this.myPeerId, {
        config: STUN_SERVERS,
        debug: 1,
      });

      this.peer.on('open', () => {
        if (!this.peer) return;

        const conn = this.peer.connect(hostRoomId, {
          reliable: true,
        });
        this.hostConnection = conn;

        conn.on('open', () => {
          if (this.onStatusCallback) {
            this.onStatusCallback('تم الاتصال بالغرفة! تجهز للعب...');
          }
          onConnected();
        });

        conn.on('data', (data: any) => {
          if (this.onMessageCallback) {
            this.onMessageCallback(data as RoomMessage);
          }
        });

        conn.on('error', (err) => {
          console.warn('Peer Connection Error:', err);
          this.setupRelayFallback(this.roomCode);
          onConnected();
        });
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS Join Warning:', err);
        this.setupRelayFallback(this.roomCode);
        onConnected();
      });
    } catch {
      this.setupRelayFallback(this.roomCode);
      onConnected();
    }
  }

  private fallbackPeerSetup(
    _roomId: string,
    onReady: (roomCode: string, peerId: string) => void,
    _onError: (err: string) => void
  ) {
    this.peer = new Peer({ config: STUN_SERVERS });
    this.peer.on('open', (id) => {
      this.myPeerId = id;
      this.setupRelayFallback(this.roomCode);
      onReady(this.roomCode, id);
    });
  }

  // Backup Realtime WebSocket Channel
  private setupRelayFallback(code: string) {
    try {
      const wsUrl = `wss://free.chatws.com/ws/${code.toLowerCase()}`;
      this.wsFallback = new WebSocket(wsUrl);

      this.wsFallback.onmessage = (evt) => {
        try {
          const parsed = JSON.parse(evt.data);
          if (parsed && parsed.senderId !== this.myPeerId && this.onMessageCallback) {
            this.onMessageCallback(parsed as RoomMessage);
          }
        } catch {
          // ignore
        }
      };
    } catch {
      // ignore
    }
  }

  // Send message to all connected peers
  public broadcastMessage(type: RoomMessage['type'], payload: any, senderName?: string) {
    const message: RoomMessage = {
      type,
      payload,
      senderId: this.myPeerId,
      senderName,
    };

    // 1. BroadcastChannel (local browser tabs)
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch {
        // ignore
      }
    }

    // 2. PeerJS WebRTC
    if (this.isHost) {
      this.connections.forEach((conn) => {
        if (conn.open) {
          try {
            conn.send(message);
          } catch {
            // ignore
          }
        }
      });
    } else if (this.hostConnection && this.hostConnection.open) {
      try {
        this.hostConnection.send(message);
      } catch {
        // ignore
      }
    }

    // 3. Backup WebSocket Relay
    if (this.wsFallback && this.wsFallback.readyState === WebSocket.OPEN) {
      try {
        this.wsFallback.send(JSON.stringify(message));
      } catch {
        // ignore
      }
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
    if (this.wsFallback) {
      try {
        this.wsFallback.close();
      } catch {
        // ignore
      }
      this.wsFallback = null;
    }
  }

  public destroy() {
    if (this.channel) {
      this.channel.close();
    }
    this.destroyPeer();
  }
}

export const multiplayerManager = new MultiplayerRoomManager();
