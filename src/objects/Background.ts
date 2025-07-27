import { Actor, Color, Engine, Graphic, Line, Material, Matrix, Raster, vec, Vector } from "excalibur";
import { GameObject } from "../utils/baseObjects/GameObject";
import { GameEngine } from "@/GameEngine";
import { config } from "process";
import shader from "@/shaders/glsl/PerlinMaterial.glsl";

export class Background extends Actor {
	engine: GameEngine;
	material: Material;
	resolution: Vector;

	constructor(engine: GameEngine) {
		const res = engine.screen.resolution
		const diagonal = Math.sqrt(res.width ** 2 + res.height ** 2)
		super({
			name: "background",
			pos: Vector.Zero,
			width: diagonal,
			height: diagonal,
			color: Color.Black,
			// anchor: Vector.Zero
		});
		this.resolution = vec(diagonal, diagonal)
		this.engine = engine

		this.material = engine.graphicsContext.createMaterial({
			name: 'test',
			fragmentSource: shader,
			color: Color.Red,
		})
		this.graphics.material = this.material
		// this.material.update(shader => {
		// 	shader.trySetUniformFloat('u_threshold', 0.96);
		// });

		// this.graphics.onPostDraw = (ctx) => {
		// 	ctx.draw<MyCustomRenderer>('myrenderer', ...);
		// }

	}


	onPreUpdate(engine: Engine, elapsedMs: number): void {
		this.updatePosition()
		this.updateGauss()
		this.updateTransmat()
	}

	updatePosition() {
		const cam = this.engine.currentScene.camera
		this.pos = cam.pos
		// this.rotation = cam.rotation
	}

	updateGauss() {
		const size = 20
		let gauss = new Array(40).fill(0);

		// https://www.desmos.com/calculator/wy0a0jumf5
		for (let i = 1; i < size * 2; i++) {
			gauss[gauss.length / 2 - size + i] =
				Math.exp(-(
					((i - size) ** 2) /
					(2 * ((size / 5) ** 2))
				))
		}

		this.material.update(shader => {
			shader.trySetUniform("uniform1fv", "u_gauss", gauss);
		});
		// console.debug(gauss)
	}

	updateTransmat() {
		const center = this.resolution.scale(0.5)

		// UV to Pixel (including Y-flip) --> Resolution Scaling and Flipping
		const uvToPixel = Matrix.identity()
			// .translate(0, this.resolution.y)
			.scale(this.resolution.x, this.resolution.y)

		// Translate camera --> Positioning
		const translate = Matrix.identity()
			.translate(this.pos.x, this.pos.y)
		// .scale(2, 2)

		// Scale around center --> Zoom
		const scale = Matrix.identity()
		// .translate(center.x, center.y)
		// .scale(1 / this.engine.currentScene.camera.zoom, 1 / this.engine.currentScene.camera.zoom)
		// .translate(-center.x, -center.y)

		// Rotate around center --> Rotation
		const rotate = Matrix.identity()
			.translate(center.x, center.y)
			.rotate(this.rotation)
			.translate(-center.x, -center.y)


		// Final composite matrix
		const viewMatrix = translate.multiply(scale).multiply(rotate).multiply(uvToPixel);

		const transmat = viewMatrix.toDOMMatrix()
		this.material.update(shader => {
			shader.trySetUniform("uniformMatrix3fv", "u_transmat", false,
				[
					transmat.a, transmat.b, 0,
					transmat.c, transmat.d, 0,
					transmat.e, transmat.f, 1,
				]);
		});
		// console.debug(transmat)
	}


}
