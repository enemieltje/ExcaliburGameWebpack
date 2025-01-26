
export type WsMessageType =
    "createNewServer" |
    "connectToServer" |
    "debug"

export interface WsMessage {
    type: WsMessageType;
    content: unknown;
}

export interface connectionData {
    name: string;
    players: number
}
