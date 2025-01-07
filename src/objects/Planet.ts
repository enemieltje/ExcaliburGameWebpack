/* eslint-disable no-console */
import { ObjectType } from "../utils/ObjectType";
import { MovingObject } from "../utils/baseObjects/MovingObject";
import { GameEngine } from "../GameEngine";
import { ActorArgs, randomIntInRange, vec, Color, Engine } from "excalibur";

export class Planet extends MovingObject {
	parentBody?: string;
	satellites: string[] = [];

	constructor(engine: GameEngine, config?: ActorArgs) {
		super(engine, {
			name: config?.name || "planet" + randomIntInRange(0, 100),
			pos: config?.pos ? vec(config!.pos!.x, config!.pos!.y) : vec(0, 0),
			vel: config?.vel ? vec(config!.vel!.x, config!.vel!.y) : vec(0, 0),
			radius: config?.radius || 2000,
			color: Color.Gray,
		});
		this.type = ObjectType.Planet;
		this.body.mass = Math.PI * (this.width / 2) * (this.width / 2) * 10;
		this.addName();
	}

	createSatellite(radius: number, r: number, angle = 0, mass?: number) {
		const planet = new Planet(this.engine, { radius });
		planet.parentBody = this.name;
		this.satellites.push(planet.name);
		if (mass) planet.body.mass = mass;
		planet.pos = this.pos.add(vec(r, 0).rotate(angle));
		// console.log(planet.name, planet.pos);

		const gravity = planet.getGravity(this);
		const acc = gravity.size / planet.body.mass;
		const inertia = Math.sqrt(acc * r) * planet.body.mass;
		// console.log(acc, inertia / planet.body.mass);
		planet.vel = this.vel.add(
			vec(inertia / planet.body.mass, 0).rotate(angle + Math.PI / 2)
		);
		this.vel = this.vel.add(vec(-inertia / this.body.mass, 0).rotate(angle + Math.PI / 2));
		// this.engine.add(planet);
		return planet;
	}

	onPostUpdate(engine: Engine, delta: number): void {
		super.onPostUpdate(engine, delta);
		if (this.parentBody) {
			const obj = this.engine.objects.get(this.parentBody)!;
			// this.drawArrow(this.name + this.parentBody, this.pos, obj.pos.sub(this.pos));
			this.drawOrbit(obj);
		}
		this.satellites.forEach(satelliteName => {
			const satellite = this.engine.objects.get(satelliteName);
			if (!satellite) return;
			this.drawArrow(satelliteName, this.pos, satellite.pos.sub(this.pos));
		});
	}
}
