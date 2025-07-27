import shader from "./glsl/PerlinShader.glsl";
import { Matrix, PostProcessor, ScreenShader, Shader, vec, Vector, VertexLayout } from "excalibur";
// const shader = require('./glsl/StarShader.glsl');

export class PerlinShader implements PostProcessor {
	private _shader?: ScreenShader;
	resolution = vec(800, 600)
	rotation = 0;
	zoom = 1;
	pos = vec(0, 0);
	threshold = 0;

	constructor(threshold: number) {
		this.threshold = threshold
	}

	initialize(gl: WebGL2RenderingContext): void {
		this._shader = new ScreenShader(gl, shader);
	}

	getLayout(): VertexLayout {
		return this._shader!.getLayout();
	}

	getShader(): Shader {
		return this._shader!.getShader();
	}

	onUpdate() {
		this.getShader().setUniform("uniform1f", "u_threshold", this.threshold)

		const center = this.resolution.scale(0.5)

		// UV to Pixel (including Y-flip) --> Resolution Scaling and Flipping
		const uvToPixel = Matrix.identity()
			.translate(0, this.resolution.y)
			.scale(this.resolution.x, -this.resolution.y)

		// Translate camera --> Positioning
		const translate = Matrix.identity().translate(this.pos.x, this.pos.y);

		// Scale around center --> Zoom
		const scale = Matrix.identity()
			.translate(center.x, center.y)
			.scale(1 / this.zoom, 1 / this.zoom)
			.translate(-center.x, -center.y)

		// Rotate around center --> Rotation
		const rotate = Matrix.identity()
			.translate(center.x, center.y)
			.rotate(this.rotation)
			.translate(-center.x, -center.y)


		// Final composite matrix
		const viewMatrix = translate.multiply(scale).multiply(rotate).multiply(uvToPixel);

		const transmat = viewMatrix.toDOMMatrix()
		this.getShader().setUniform("uniformMatrix3fv", "u_transmat", false,
			[
				transmat.a, transmat.b, 0,
				transmat.c, transmat.d, 0,
				transmat.e, transmat.f, 1,
			]
		)
		// console.log(`Transmat: (${transmat.a}, ${transmat.b})`)
		// console.log(`Length: ${this.resolution.x / vec(transmat.a, transmat.b).magnitude}`)
	}

	setResolution(resolution: Vector) {
		this.resolution = resolution;
		return this;
	}

	setRotation(rotation: number) {
		this.rotation = rotation;
		return this;
	}

	setPos(pos: Vector) {
		this.pos = pos;
		return this;
	}

	setZoom(zoom: number) {
		this.zoom = zoom;
		return this;
	}
}
export const starShader = (threshold: number) => new PerlinShader(threshold);
