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
export class Orbit extends Actor {
	parentActor: GameObject;
	arrowColor: Color;
	ellipse: Ellipse;
	constructor(parentActor: GameObject, color = Color.Red) {
		super({});

		this.arrowColor = color;
		this.parentActor = parentActor;
		this.graphics.anchor = Vector.Zero;
		parentActor.scene.add(this);
		this.ellipse = new Ellipse();
		this.graphics.use(this.ellipse);
	}

	set(start: Vector, e: Vector, a: number) {
		const b = a * Math.sqrt(1 - e.size * e.size);
		const cam = this.parentActor.scene.camera;
		this.pos = cam.pos.sub(
			vec(cam.viewport.width / 2, cam.viewport.height / 2).rotate(-cam.rotation)
		);
		this.rotation = -cam.rotation;

		const parentBodyPos = this.parentActor.engine.worldToScreenCoordinates(start);
		this.ellipse.pos = parentBodyPos;
		this.ellipse.e = e.rotate(-this.rotation);
		this.ellipse.a = a;
		this.ellipse.b = b;
		this.ellipse.flagDirty();
	}
}

class Ellipse extends Raster {
	a: number;
	b: number;
	e: Vector;
	pos: Vector;

	constructor(pos = Vector.Zero, e = Vector.Zero, a = 0, b = 0) {
		super({ width: window.innerWidth, height: window.innerHeight });
		this.a = a;
		this.b = b;
		this.e = e;
		this.pos = pos;
	}

	execute(ctx: CanvasRenderingContext2D): void {
		ctx.beginPath();
		ctx.strokeStyle = "blue";
		const c = this.pos.sub(this.e.scale(this.a));
		ctx.ellipse(c.x, c.y, this.a, this.b, this.e.toAngle(), 0, 2 * Math.PI);
		ctx.stroke();
	}

	clone(): Graphic {
		return new Ellipse(this.pos.clone(), this.e.clone(), this.a, this.b);
	}
}
