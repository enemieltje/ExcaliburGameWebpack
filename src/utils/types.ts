import { Vector } from "excalibur";
import { GameObject } from "./baseObjects/GameObject";

// TODO: better typing:
// export interface WsMessage<T> {
// 	destination: WsDestination;
// 	type: string;
// 	content: T;
// }
export interface WsMessage {
	type: string;
	content: unknown;
}

export type OrbitData = {
	planet: GameObject;
	pos: Vector;
	r: Vector;
	rdot: Vector;
	u: number;
	h: number;
	e: Vector;
	a: number;
	b: number;
	c: Vector;
};
