/* eslint-disable no-console */
import { ObjectType } from "../utils/ObjectType";
import { MovingObject } from "../utils/baseObjects/MovingObject";
import { GameEngine } from "../GameEngine";
import { ActorArgs, randomIntInRange, vec, Color, Engine, CollisionType, Vector } from "excalibur";
import { Orbit } from "@/utils/types";

export class Planet extends MovingObject {
	parentBody?: string;
	satellites: string[] = [];

	constructor(engine: GameEngine, config?: ActorArgs) {
		super(engine, {
			collisionType: CollisionType.Fixed,
			name: config?.name || "planet" + randomIntInRange(0, 100),
			pos: config?.pos ? vec(config!.pos!.x, config!.pos!.y) : vec(0, 0),
			vel: config?.vel ? vec(config!.vel!.x, config!.vel!.y) : vec(0, 0),
			radius: config?.radius || 2000,
			color: Color.Gray,
		});
		this.name = "planet" + this.id
		this.type = ObjectType.Planet;
		this.body.mass = Math.PI * (this.width / 2) * (this.width / 2) * 10;
		this.addName();
	}

	createSatellite(radius: number, r: number, angle = 0, mass?: number) {

		const orbit = new Orbit(this, r, vec(1E-16, 0).rotate(angle))
		const planet = new Planet(this.engine, { radius });

		planet.parentBody = this.name;
		this.satellites.push(planet.name);
		if (mass) planet.body.mass = mass;
		planet.lastKnownOrbit = orbit

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
