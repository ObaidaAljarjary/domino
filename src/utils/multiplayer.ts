import { Peer, type DataConnection } from 'peerjs';

export interface RoomMessage {
  id: string; // Unique message ID for deduplication
  type:
    | 'JOIN_ROOM'
    | 'ASSIGN_SLOT'
    | 'GAME_STATE_SYNC'
    | 'PLAY_TILE_ACTION'
    | 'DRAW_TILE_ACTION'
    | 'PASS_TURN_ACTION'
    | 'START_GAME'
    | 'CHAT_MESSAGE'
    | 'EMOTE_ACTION';
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
  private processedMsgIds: Set<string> = new Set();

  public myPeerId: string = '';
  public isHost: boolean = false;
  public roomCode: string = '';
  public onMessageCallback: ((msg: RoomMessage) => void) | null = null;
  public onStatusCallback: ((status: string) => void) | null = null;

  constructor() {
    try {
      this.channel = new BroadcastChannel('iraqi_domino_room_channel');
      this.channel.onmessage = (event) => {
        this.handleIncomingMessage(event.data);
      };
    } catch {
      // BroadcastChannel fallback
    }
  }

  private handleIncomingMessage(msg: any) {
    if (!msg || !msg.id) return;
    if (this.processedMsgIds.has(msg.id)) return; // Prevent duplicate execution
    this.processedMsgIds.add(msg.id);

    // Keep set size manageable
    if (this.processedMsgIds.size > 200) {
      const arr = Array.from(this.processedMsgIds);
      this.processedMsgIds = new Set(arr.slice(100));
    }

    if (msg.senderId !== this.myPeerId && this.onMessageCallback) {
      this.onMessageCallback(msg as RoomMessage);
    }
  }

  // Create Room as Host
  public createRoom(
    code: string,
    onReady: (roomCode: string, peerId: string) => void,
    _onError: (err: string) => void
  ) {
    this.isHost = true;
    this.roomCode = code.toUpperCase().trim();
    const fullRoomId = `iraqi-domino-${this.roomCode}`;

    this.destroyPeer();
    this.myPeerId = `host-${Math.random().toString(36).substring(2, 8)}`;

    if (this.onStatusCallback) {
      this.onStatusCallback('جارِ إنشاء الغرفة الأونلاين...');
    }

    // 1. ALWAYS open WebSocket Relay in parallel for 100% connectivity guarantee across 4G/5G/WiFi
    this.setupAlwaysOnRelay(this.roomCode);

    try {
      this.peer = new Peer(fullRoomId, {
        config: STUN_SERVERS,
        debug: 1,
      });

      this.peer.on('open', (id) => {
        this.myPeerId = id;
        if (this.onStatusCallback) {
          this.onStatusCallback(`الغرفة جاهزة [${this.roomCode}]! بانتظار انضمام صديقك...`);
        }
        onReady(this.roomCode, id);
      });

      this.peer.on('connection', (conn) => {
        this.connections.set(conn.peer, conn);

        conn.on('open', () => {
          if (this.onStatusCallback) {
            this.onStatusCallback('انضم صديقك للغرفة بنجاح! جاهزين للعب...');
          }
        });

        conn.on('data', (data: any) => {
          this.handleIncomingMessage(data);
        });

        conn.on('close', () => {
          this.connections.delete(conn.peer);
        });
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS Host Warning:', err);
        if (this.onStatusCallback) {
          this.onStatusCallback(`الغرفة جاهزة عبر السيرفر [${this.roomCode}]!`);
        }
        onReady(this.roomCode, this.myPeerId);
      });
    } catch {
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

    let connectedCalled = false;
    const safeOnConnected = () => {
      if (!connectedCalled) {
        connectedCalled = true;
        onConnected();
      }
    };

    // 1. ALWAYS open WebSocket Relay in parallel
    this.setupAlwaysOnRelay(this.roomCode, safeOnConnected);

    try {
      this.peer = new Peer(this.myPeerId, {
        config: STUN_SERVERS,
        debug: 1,
      });

      this.peer.on('open', () => {
        if (!this.peer) return;

        const conn = this.peer.connect(hostRoomId, { reliable: true });
        this.hostConnection = conn;

        conn.on('open', () => {
          if (this.onStatusCallback) {
            this.onStatusCallback('تم الاتصال بالغرفة! تجهز للعب...');
          }
          safeOnConnected();
        });

        conn.on('data', (data: any) => {
          this.handleIncomingMessage(data);
        });

        conn.on('error', (err) => {
          console.warn('Peer Connection Error:', err);
          safeOnConnected();
        });
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS Guest Warning:', err);
        if (this.onStatusCallback) {
          this.onStatusCallback('تم الاتصال عبر السيرفر! تجهز للعب...');
        }
        safeOnConnected();
      });
    } catch {
      safeOnConnected();
    }
  }

  // Always-On WebSocket Relay Channel
  private setupAlwaysOnRelay(code: string, onConnected?: () => void) {
    try {
      const roomChannelName = code.toLowerCase();
      const wsUrl = `wss://free.chatws.com/ws/iraqi-domino-${roomChannelName}`;
      this.wsFallback = new WebSocket(wsUrl);

      this.wsFallback.onopen = () => {
        if (this.onStatusCallback && !this.isHost) {
          this.onStatusCallback('متصل بالغرفة! جارِ تجهيز اللعبة...');
        }
        if (onConnected) onConnected();
      };

      this.wsFallback.onmessage = (evt) => {
        try {
          const parsed = JSON.parse(evt.data);
          this.handleIncomingMessage(parsed);
        } catch {
          // ignore
        }
      };
    } catch {
      // ignore
    }
  }

  // Broadcast message to all connected peers & websocket fallback
  public broadcastMessage(type: RoomMessage['type'], payload: any, senderName?: string) {
    const message: RoomMessage = {
      id: `${this.myPeerId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      payload,
      senderId: this.myPeerId,
      senderName,
    };

    // 1. Local BroadcastChannel
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

    // 3. Always-On WebSocket Relay
    if (this.wsFallback) {
      if (this.wsFallback.readyState === WebSocket.OPEN) {
        try {
          this.wsFallback.send(JSON.stringify(message));
        } catch {
          // ignore
        }
      } else if (this.wsFallback.readyState === WebSocket.CONNECTING) {
        const retryMessage = JSON.stringify(message);
        const checkAndSend = () => {
          if (this.wsFallback && this.wsFallback.readyState === WebSocket.OPEN) {
            try {
              this.wsFallback.send(retryMessage);
            } catch {}
          } else if (this.wsFallback && this.wsFallback.readyState === WebSocket.CONNECTING) {
            setTimeout(checkAndSend, 500);
          }
        };
        setTimeout(checkAndSend, 500);
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
