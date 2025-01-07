import { ObjectType } from "../ObjectType";
import { GameObject } from "./GameObject";
import { GameEngine } from "../../GameEngine";
import { Arrow, Orbit } from "../../objects/Arrow";
import { OrbitData } from "../types";
import { orbitShader } from "../../shaders/OrbitShader";
import { ActorArgs, CollisionType, Vector, Text, Actor, vec, Engine } from "excalibur";

export class MovingObject extends GameObject {
	forceArrows: Record<string, Arrow> = {};
	orbits: Record<string, Orbit> = {};
	forces: Record<string, Vector> = {};
	torques: Record<string, number> = {};

	constructor(engine: GameEngine, config?: ActorArgs) {
		super(engine, config);
		this.type = ObjectType.MovingObject;
		this.body.mass = this.width * this.height || 10;
		this.body.collisionType = CollisionType.Active;
		this.body.bounciness = 0.001;
	}

	addName() {
		const text = new Text({
			text: this.name,
			width: this.width,
			height: this.height,
		});

		this.namePlate = new Actor({
			name: this.name + "namePlate",
			anchor: vec(0.5, -0.1),
			// pos: vec(0, 10),
		});
		this.namePlate.graphics.use(text);
		this.addChild(this.namePlate);
	}

	getOrbit(planet?: GameObject) {
		if (!planet) planet = this.findOrbitObject();
		if (!planet) return;
		const r = this.pos.sub(planet.pos);
		const rdot = this.vel.sub(planet.vel);
		const u = this.body.mass + planet.body.mass;
		const h = r.cross(rdot); // orbital momentum

		const e = rdot
			.cross(h)
			.scale(1 / u)
			.sub(r.normalize()); // eccentricity

		const a = 1 / (2 / r.size - (rdot.size * rdot.size) / u); // semi major axis
		const b = a * Math.sqrt(1 - e.size * e.size);
		const c = this.engine.worldToScreenCoordinates(planet.pos.sub(e.scale(a)));
		const pos = this.engine.worldToScreenCoordinates(planet.pos);

		const orbitData: OrbitData = { planet, pos, r, rdot, u, h, e, a, b, c };
		return orbitData;
	}

	pathPredict(length: number, _delta: number, scale = 1) {
		const planets = [this.findOrbitObject()!];
		const pos = this.pos.clone();
		const vel = this.vel.clone();
		const seconds = scale / this.engine.stats.currFrame.fps;

		for (let i = 0; i < length; i++) {
			const acc = Vector.Zero;
			for (const planet of planets) {
				acc.addEqual(this.getGravity(planet, pos));
			}
			acc.scaleEqual(this.body.inverseMass);
			const lastPos = pos.clone();

			vel.addEqual(acc.scale(seconds));
			pos.addEqual(vel.scale(seconds));

			this.drawArrow("path" + i + scale, lastPos, pos.sub(lastPos));
		}
	}

	findOrbitObject() {
		// Find the closest planet
		// console.log(this.parentBody);
		// if (this.parentBody) return this.engine.objects.get(this.parentBody);
		let maxForce = 0;
		let planetName = "";
		for (const forceName in this.forces) {
			if (!forceName.includes("gravity")) continue;
			const force = this.forces[forceName]!.size;
			if (force < maxForce) continue;
			maxForce = force;
			planetName = forceName.replace("_gravity", "");
		}
		return this.engine.objects.get(planetName);
	}

	getGravity(planet: GameObject, pos = this.pos) {
		const diff = planet.pos.sub(pos);
		const distance = diff.size;
		if (!distance) return Vector.Zero;

		return diff.normalize().scale((planet.body.mass * this.body.mass) / diff.size ** 2);
	}

	updateGravity() {
		this.engine.objects.forEach(gameObject => {
			if (gameObject.body.collisionType != CollisionType.Active) return;
			if (this.name == gameObject.name) return;

			const gravity = this.getGravity(gameObject);
			this.forces[`${gameObject.name}_gravity`] = gravity;
		});
	}

	drawArrow(name: string, start: Vector, vec: Vector) {
		if (!this.forceArrows[name]) {
			this.forceArrows[name] = new Arrow(this);
		}
		this.forceArrows[name]?.set(start, vec);
	}

	drawEllipse(name: string, start: Vector, e: Vector, a: number) {
		if (!this.orbits[name]) {
			this.orbits[name] = new Orbit(this);
		}
		this.orbits[name]?.set(start, e, a);
	}

	drawOrbit(planet?: GameObject) {
		const orbit = this.getOrbit(planet);
		if (!orbit) return;
		// this.drawEllipse("orbit", orbit.planet.pos, orbit.e, orbit.a);
		const direction = orbit.rdot.cross(orbit.r) > 0 ? 1 : -1;
		this.drawArrow(
			"circularize",
			this.pos,
			orbit.e.scale(100).rotate((direction * Math.PI) / 2)
		);
		orbitShader.setOrbit(this.name, orbit);
	}

	onPreUpdate(engine: Engine, delta: number): void {
		super.onPreUpdate(engine, delta);
	}

	update(engine: Engine, delta: number): void {
		this.updateGravity();
		this.acc = Vector.Zero;
		for (const forceName in this.forces) {
			this.acc.addEqual(this.forces[forceName]!);
		}
		this.acc.scaleEqual(this.body.inverseMass);
		this.body.torque = 0;
		for (const torqueName in this.torques) {
			this.body.torque += this.torques[torqueName]!;
		}

		if (this.namePlate)
			this.namePlate.rotation = -this.engine.currentScene.camera.rotation - this.rotation;
		super.update(engine, delta);
	}

	onPostUpdate(engine: Engine, delta: number): void {
		super.onPostUpdate(engine, delta);
	}
}
