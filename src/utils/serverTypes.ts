
export type WsMessageType =
    "createNewServer" |
    "connectToServer" |
    "getParts" |
    "getInterfaces" |
    "parts" |
    "interfaces" |
    "debug"

export interface WsMessage {
    type: WsMessageType;
    content: unknown;
}

export interface connectionData {
    name: string;
    players: number
}

export type PartsMetaData = {
    parts: Record<string, PartMetaData>,
    interfaces: Record<string, InterfaceMetaData>,
};

export type PartMetaData = {
    name: string,
    imagePaths: string[],
    interfaces: InterfaceLocationMetaData[],
};

export type InterfaceLocationMetaData = {
    name: string,
    x: number,
    y: number,
}

export type InterfaceMetaData = {
    name: string,
    color?: string,
}
