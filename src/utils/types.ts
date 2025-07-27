import { vec, Vector } from "excalibur";
import { GameObject } from "./baseObjects/GameObject";

// TODO: better typing:
// export interface WsMessage<T> {
// 	destination: WsDestination;
// 	type: string;
// 	content: T;
// }

export enum ObjectType {
	"GameObject",
	"MovingObject",
	"Player",
	"Planet",
}

export type Propagator = "Kepler" | "Step"

export type GameSaveData = {
	elapsedMs: number,
	objects: ObjectSaveData[]
}

export type ObjectSaveData = {
	name: string,
	type: ObjectType,
	pos: { x: number, y: number },
	vel?: { x: number, y: number },
	mass?: number,
	lastKnownOrbit?: OrbitSaveData,
	propagator?: Propagator
}

export type OrbitSaveData = {
	centralBody: string,
	a: number,
	e: { x: number, y: number }
}

export type ShaderOrbit = {
	rotation: number;
	a: number;
	b: number;
	pos: Vector;
}

export class Orbit {
	centralBody: GameObject
	satellite?: GameObject
	a: number
	eccentricityVector: Vector

	constructor(centralBody: GameObject, a: number, eccentricityVector: Vector) {
		this.centralBody = centralBody
		this.a = a
		this.eccentricityVector = eccentricityVector
	}

	saveData() {
		return {
			centralBody: this.centralBody.name,
			// satellite: this.satellite.name,
			a: this.a,
			// eccentricityVector: this.eccentricityVector,
			e: { x: this.eccentricityVector.x, y: this.eccentricityVector.y },
		}
	}

	static fromObject(centralBody: GameObject, satellite: GameObject) {
		const r = satellite.pos.sub(centralBody.pos)
		const rdot = satellite.vel.sub(centralBody.vel)
		const mu = centralBody.body.mass

		const h = r.cross(rdot); // orbital momentum

		const eccentricityVector = rdot
			.cross(h)
			.scale(1 / mu)
			.sub(r.normalize()); // eccentricity

		const a = 1 / (2 / r.magnitude - (rdot.magnitude ** 2) / mu); // semi major axis

		const orbit = new Orbit(centralBody, a, eccentricityVector)
		orbit.satellite = satellite
		return orbit
	}

	get e() {
		return this.eccentricityVector.magnitude
	}

	get shaderData(): ShaderOrbit {


		const b = this.a * Math.sqrt(1 - this.e ** 2);
		const pos = this.centralBody.engine.worldToScreenCoordinates(
			this.centralBody.pos.sub(this.eccentricityVector.scale(this.a))
		);

		return {
			rotation: this.eccentricityVector.toAngle(),
			a: this.a,
			b: b,
			pos: pos
		}
	}

	get elapsedMs() {
		return this.centralBody.engine.elapsedMs
	}

	get mu() {
		return this.centralBody.body.mass
	}

	get period() {
		return 2 * Math.PI * Math.sqrt(
			(this.a ** 3) /
			(this.centralBody.body.mass) // * gravitational constant?
		)
	}

	get meanAnomaly() {
		return 2 * Math.PI * (this.elapsedMs / 1000 / this.period)
	}

	get eccentricAnomaly() {
		let eccentricAnomaly = 0
		for (let i = 0; i < 10; i++) {
			eccentricAnomaly = this.meanAnomaly - (this.e * Math.sin(eccentricAnomaly))
		}
		return eccentricAnomaly
	}

	get trueAnomaly() {
		return 2 * Math.atan(
			Math.tan(this.eccentricAnomaly / 2) *
			Math.sqrt(
				(1 + this.e) /
				(1 - this.e)
			)
		)
	}

	get distance() {
		return (this.a * (1 - this.e ** 2)) /
			(1 + (this.e * Math.cos(this.trueAnomaly)))
	}

	get r() {
		if (this.satellite) return this.satellite.pos.sub(this.centralBody.pos)
		else return vec(this.distance, 0).rotate(this.trueAnomaly)
	}

	get velocity() {
		return Math.sqrt(
			this.mu *
			((2 / this.distance) -
				(1 / this.a))
		)
	}

	get rdot() {
		if (this.satellite) return this.satellite.vel.sub(this.centralBody.vel)
		else return vec(this.velocity, 0).rotate(this.velocity_angle)
	}

	get velocity_angle() {
		return this.trueAnomaly + Math.PI / 2 -
			(this.e * Math.sin(this.trueAnomaly)) /
			(1 + (this.e * Math.cos(this.trueAnomaly)))
	}

	get worldPosition() {
		return this.r.add(this.centralBody.pos)
	}
}
