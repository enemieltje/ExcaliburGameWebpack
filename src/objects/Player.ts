/* eslint-disable no-console */
import { MovingObject } from "../utils/baseObjects/MovingObject";

import { ObjectType } from "../utils/ObjectType";
import { Arrow } from "./Arrow";
import { Autopilot, AutopilotMode } from "../Autopilot";
import { MyCamera, CameraMode } from "../Camera";
import { WheelEvent, ActorArgs, Color, Engine, Keys, randomIntInRange, vec, Vector } from "excalibur";
import { GameEngine } from "@/GameEngine";

export class Player extends MovingObject {
	speed: number;
	controls = false;
	cam?: MyCamera;
	arrows: Record<string, Arrow> = {};
	autopilot?: Autopilot;

	constructor(engine: GameEngine, config?: ActorArgs) {
		super(engine, {
			name: config?.name || "player" + randomIntInRange(0, 100),
			x: 160600,
			y: 0,
			// vel: vec(40, 0),
			width: 50,
			height: 50,
			color: Color.Magenta,
		});
		this.type = ObjectType.Player;
		this.body.mass = 25;
		this.speed = this.body.mass * 30;

		this.addName();
	}

	start(): void {
		this.engine.input.pointers.on("wheel", evt => {
			this.zoomCam(evt);
		});
	}

	zoomCam(evt: WheelEvent) {
		// console.log(evt);
		if (!this.cam) return;
		this.cam.setZoom(-evt.deltaY / 400);
		// console.log(evt.deltaY, this.cam.camera.zoom);
	}

	resolveKeys() {
		if (!this.autopilot) {
			this.autopilot = new Autopilot(this);
			this.autopilot.setMode(AutopilotMode.Rotation);
		}
		if (!this.cam && this.controls) {
			this.cam = new MyCamera(this.engine.currentScene.camera, this);
			this.cam.setMode(CameraMode.FollowPos);
		}
		let kbForce = vec(0, 0);
		// this.forces.keyboard = vec(0, 0);
		this.torques.keyboard = 0;
		this.keyList.forEach(key => {
			switch (key) {
				case Keys.W:
				case Keys.Up:
					kbForce.addEqual(Vector.Up);
					// this.forces.keyboard?.addEqual(vec(0, -1));
					break;
				case Keys.A:
				case Keys.Left:
					kbForce.addEqual(Vector.Left);
					// this.forces.keyboard?.addEqual(vec(-1, 0));
					break;
				case Keys.S:
				case Keys.Down:
					kbForce.addEqual(Vector.Down);
					// this.forces.keyboard?.addEqual(vec(0, 1));
					break;
				case Keys.D:
				case Keys.Right:
					kbForce.addEqual(Vector.Right);
					// this.forces.keyboard?.addEqual(vec(1, 0));
					break;
				case Keys.Q:
					this.torques.keyboard = -this.speed / 100 / this.body.mass;
					break;
				case Keys.E:
					this.torques.keyboard = this.speed / 100 / this.body.mass;
					break;
				case Keys.V:
					if (this.lastKeyList.includes(Keys.V)) break;
					this.keyList.includes(Keys.ShiftLeft)
						? this.autopilot!.incrementMode(-1)
						: this.autopilot!.incrementMode();
					// if (this.engine.type == "ClientEngine") console.log(this.autopilot!.getMode());
					break;
				case Keys.C:
					if (this.lastKeyList.includes(Keys.C)) break;
					if (this.cam && this.controls) {
						this.keyList.includes(Keys.ShiftLeft)
							? this.cam!.incrementMode(-1)
							: this.cam!.incrementMode();
						// if (this.engine.type == "ClientEngine") console.log(this.cam!.getMode());
					}
					break;
			}
		});
		// if (this.forces.keyboard.size > 0) {
		if (kbForce.size > 0) {
			// this.forces.keyboard.size = this.speed;
			kbForce.size = this.speed;
			// console.log(this.engine.type, this.cam?.rotation);
			// if (this.cam) this.forces.keyboard = this.forces.keyboard.rotate(-this.cam.rotation);
			if (this.cam) kbForce = kbForce.rotate(-this.cam.rotation);
		}
		if (!this.forces.keyboard?.equals(kbForce) && this.controls) {
			this.forces.keyboard = kbForce;
			// console.log(kbForce.toString());
			this.engine.send({
				type: "input",
				content: {
					name: this.name,
					type: "kbForce",
					content: { x: kbForce.x, y: kbForce.y },
				},
			});
		}
	}

	onPreUpdate(engine: Engine, delta: number): void {
		this.autopilot?.update();
		this.cam?.update();
		if (this.controls) {
			this.keyList = this.engine.input.keyboard.getKeys() || [];
			this.sendKeys();
		}
		this.resolveKeys();
		super.onPreUpdate(engine, delta);
	}

	update(engine: Engine, delta: number): void {
		super.update(engine, delta);
		// const text = this.children[0] as Actor;
		// text.rotation = -this.engine.currentScene.camera.rotation - this.rotation;

		// if (this.cam) {
		// 	this.cam.rotation = -this.rotation;
		// }
	}

	onPostUpdate(engine: Engine, delta: number): void {
		super.onPostUpdate(engine, delta);
		this.drawOrbit();
	}

	sendKeys() {
		if (this.keyList.toString() == this.lastKeyList.toString()) return;
		this.engine.send({
			type: "input",
			content: {
				name: this.name,
				type: "keys",
				content: this.keyList,
			},
		});
	}
}
