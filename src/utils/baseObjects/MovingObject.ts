import { ObjectType } from "../ObjectType";
import { GameObject } from "./GameObject";
import { GameEngine } from "../../GameEngine";
import { Arrow } from "../../objects/Arrow";
import { Orbit, Propagator } from "../types";
import { orbitShader } from "../../shaders/OrbitShader";
import { ActorArgs, CollisionType, Vector, Text, Actor, vec, Engine, Color } from "excalibur";

export class MovingObject extends GameObject {
	forceArrows: Record<string, Arrow> = {};
	forces: Record<string, Vector> = {};
	torques: Record<string, number> = {};
	propagator: Propagator = "Kepler";
	lastKnownOrbit: Orbit;

	constructor(engine: GameEngine, config?: ActorArgs) {
		super(engine, config);
		this.type = ObjectType.MovingObject;
		this.body.mass = this.width * this.height || 10;
		this.body.collisionType = CollisionType.Active;
		this.body.bounciness = 0.001;
		// this.updateGravity();
		// this.lastKnownOrbit = this.getOrbit()
		// console.debug(
		// 	`name: ${this.name}`,
		// 	`lastKnownOrbit: ${this.lastKnownOrbit?.planet?.name}`)
	}

	saveData() {
		return {
			...super.saveData(),
			mass: this.body.mass,
			lastKnownOrbit: this.getOrbit()?.saveData(),
			propagator: this.propagator
		}
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
		});
		this.namePlate.graphics.use(text);
		this.addChild(this.namePlate);
	}

	getOrbit(planet?: GameObject) {

		switch (this.propagator) {
			case "Kepler":
				return this.lastKnownOrbit
			case "Step":
				if (!planet) planet = this.findOrbitObject();
				if (!planet) return;

				const orbit = Orbit.fromObject(planet, this)

				return orbit
		}

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

	drawOrbit(planet?: GameObject) {
		const orbit = this.getOrbit(planet);
		// const orbit = this.lastKnownOrbit;
		if (!orbit) return;

		const direction = orbit.rdot.cross(orbit.r) > 0 ? 1 : -1;
		this.drawArrow(
			"circularize",
			this.pos,
			orbit.eccentricityVector.scale(100).rotate((direction * Math.PI) / 2)
		);
		orbitShader.setOrbit(this.name, orbit.shaderData);
	}

	onPreUpdate(engine: Engine, delta: number): void {
		super.onPreUpdate(engine, delta);
	}

	update(engine: Engine, delta: number): void {
		switch (this.propagator) {
			case "Kepler":
				this.propagateKepler()
				break;
			case "Step":
				this.propagateStep()
				break;
		}
		super.update(engine, delta);
	}

	propagateKepler() {
		if (!this.lastKnownOrbit) return
		this.pos = this.lastKnownOrbit.worldPosition
		this.vel = this.lastKnownOrbit.rdot.add(this.lastKnownOrbit.centralBody.vel)
	}

	propagateStep() {
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

	}

	onPostUpdate(engine: Engine, delta: number): void {
		super.onPostUpdate(engine, delta);
	}
}
