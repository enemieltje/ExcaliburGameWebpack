import { MovingObject } from "./utils/baseObjects/MovingObject";
import { Player } from "./objects/Player";
import { vec } from "excalibur";
// import { Arrow } from "./objects/Arrow";

export class Autopilot {
	object: MovingObject;
	mode = AutopilotMode.None;
	integralSum = 0;
	// debugArrow: Arrow;

	constructor(actor: MovingObject) {
		this.object = actor;
		// this.debugArrow = new Arrow(actor);
	}

	getMode(mode = this.mode) {
		return Object.values(AutopilotMode)[mode];
	}

	setMode(mode: AutopilotMode) {
		this.object.forces.autopilot = vec(0, 0);
		this.object.torques.autopilot = 0;
		this.integralSum = 0;
		this.mode = mode;
	}

	incrementMode(amount = 1) {
		const length = Object.keys(AutopilotMode).length / 2;
		let newMode = this.mode + amount;
		if (newMode < length) newMode += length;
		this.setMode(newMode % length);
	}

	update() {
		switch (this.mode) {
			case AutopilotMode.Drag:
				this.updateDrag();
				break;
			case AutopilotMode.Orbit:
				this.updateOrbit();
				break;
			case AutopilotMode.Position:
				this.updatePosition();
				break;
			case AutopilotMode.Rotation:
				this.updateRotation();
				break;
			case AutopilotMode.PosRot:
				this.updatePosition();
				this.updateRotation();
				break;
			case AutopilotMode.Circularize:
				this.updateCircularize();
				break;
		}
	}

	updateDrag() {
		this.object.forces.autopilot = this.object.vel.negate();
		return this.object.forces.autopilot;
	}

	updatePosition() {
		const drag = this.updateDrag();
		const acc = vec(0, 0);

		for (const forceName in this.object.forces) {
			if (forceName == "keyboard" || forceName == "autopilot") continue;
			acc.addEqual(this.object.forces[forceName]!);
		}
		this.object.forces.autopilot = acc
			.negate()
			.add(this.object.vel.negate())
			.add(drag.scale(5));
		return this.object.forces.autopilot;
	}

	updateRotation() {
		this.object.torques.autopilot = 0;
		for (const torqueName in this.object.torques) {
			if (torqueName == "keyboard" || torqueName == "autopilot") continue;
			this.object.torques.autopilot += this.object.torques[torqueName]!;
		}
		this.object.torques.autopilot -= this.object.angularVelocity;
	}

	updateCircularize() {
		this.updateOrbit();
		const orbit = this.object.getOrbit();
		if (!orbit) return;
		this.object.forces.autopilot = orbit.e
			.scale((this.object as Player).speed || 1000)
			.rotate(-Math.PI / 2);
		return this.object.forces.autopilot;
	}

	updateOrbit() {
		this.object.torques.autopilot = 0;

		// Derivative controller
		this.updateRotation();

		const planet = this.object.findOrbitObject();

		if (planet) {
			// Find the setPoint and current deviation from it
			const setPointAngle = this.object.pos.sub(planet.pos);

			let errorAngle =
				(setPointAngle.toAngle() - this.object.rotation + 0.5 * Math.PI) % (2 * Math.PI);
			if (errorAngle < -Math.PI) errorAngle += 2 * Math.PI;
			if (errorAngle > Math.PI) errorAngle = 2 * Math.PI - errorAngle;

			// Proportional controller
			this.object.torques.autopilot += errorAngle;

			// Integral controller
			this.integralSum += errorAngle;
			this.object.torques.autopilot += 0.001 * this.integralSum;
		}
	}
}

export enum AutopilotMode {
	None = 0,
	Drag = 1,
	Position = 2,
	Rotation = 3,
	PosRot = 4,
	Orbit = 5,
	Circularize = 6,
}
