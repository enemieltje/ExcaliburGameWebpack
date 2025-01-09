import { GameObject } from "./utils/baseObjects/GameObject";
import { ObjectType } from "./utils/ObjectType";
import { MovingObject } from "./utils/baseObjects/MovingObject";
import { Camera } from "excalibur";

export class MyCamera {
	object: GameObject;
	mode = CameraMode.None;
	integralSum = 0;
	camera: Camera;
	zoom = 0;
	// debugArrow: Arrow;

	get rotation() {
		return this.camera.rotation;
	}

	constructor(camera: Camera, actor: GameObject) {
		this.camera = camera;
		this.object = actor;
	}

	getMode(mode = this.mode) {
		return Object.values(CameraMode)[mode];
	}

	setMode(mode: CameraMode) {
		this.mode = mode;
	}

	incrementMode(amount = 1) {
		const length = Object.keys(CameraMode).length / 2;
		let newMode = this.mode + amount;
		if (newMode < length) newMode += length;
		this.setMode(newMode % length);
	}

	setObject(actor: GameObject) {
		// this.camera.strategy.lockToActor(actor);
		this.object = actor;
	}

	update() {
		switch (this.mode) {
			case CameraMode.None:
				this.updateNone();
				break;
			case CameraMode.FollowPos:
				this.updateFollowPos();
				break;
			case CameraMode.Follow:
				this.updateFollow();
				break;
			case CameraMode.Direction:
				this.updateDirection();
				break;
			case CameraMode.Orbit:
				this.updateOrbit();
				break;
		}
	}

	setZoom(amount: number) {
		this.zoom += amount;
		// this.camera.zoom = Math.exp(this.zoom);
		this.camera.zoomOverTime(Math.exp(this.zoom), 50);
	}

	updateNone() {
		this.camera.rotation = 0;
	}

	updateFollowPos() {
		this.camera.pos = this.object.pos;
	}

	updateFollow() {
		this.updateFollowPos();
		this.camera.rotation = -this.object.rotation;
	}

	updateDirection() {
		this.updateFollowPos();

		if (this.object.type == ObjectType.GameObject) return;
		const movingObject = this.object as MovingObject;
		const orbit = movingObject.getOrbit();
		// const planet = movingObject.findOrbitObject();

		if (!orbit) {
			this.camera.rotation = -this.object.vel.toAngle();
			return;
		}
		const direction = orbit.rdot.cross(orbit.r) > 0 ? Math.PI : 0;
		this.camera.rotation = -this.object.vel.sub(orbit.centralBody.vel).toAngle() + direction;
	}

	updateOrbit() {
		this.updateFollowPos();

		if (this.object.type == ObjectType.GameObject) return;
		const movingObject = this.object as MovingObject;
		const planet = movingObject.findOrbitObject();

		if (!planet) return;

		const setPointAngle = movingObject.pos.sub(planet.pos);

		this.camera.rotation = -setPointAngle.toAngle() - Math.PI / 2;
	}
}

export enum CameraMode {
	None = 0,
	FollowPos = 1,
	Follow = 2,
	Direction = 3,
	Orbit = 4,
}
