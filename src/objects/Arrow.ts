import { Actor, Color, Graphic, Line, Raster, vec, Vector } from "excalibur";
import { GameObject } from "../utils/baseObjects/GameObject";

export class Arrow extends Actor {
	parentActor: GameObject;
	arrowColor: Color;
	constructor(parentActor: GameObject, color = Color.Red) {
		super({});

		this.arrowColor = color;
		this.parentActor = parentActor;
		this.graphics.anchor = Vector.Zero;
		parentActor.scene.add(this);
	}

	set(start: Vector, vector: Vector) {
		const angle = vector.toAngle();
		this.rotation = angle;
		this.pos = start;
		this.graphics.use(
			new Line({
				start: vec(0, 0),
				end: vector.rotate(-angle),
				color: this.arrowColor,
				thickness: 2 / this.parentActor.engine.currentScene.camera.zoom,
			})
		);
	}
}
