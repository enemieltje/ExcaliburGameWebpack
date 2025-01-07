import shader from "./glsl/StarShader.glsl";
import { PostProcessor, ScreenShader, Shader, vec, Vector, VertexLayout } from "excalibur";
// const shader = require('./glsl/StarShader.glsl');

export class StarShader implements PostProcessor {
	private _shader?: ScreenShader;
	rotation = 0;
	zoom = 1;
	pos = vec(0, 0);

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
		this.getShader().setUniform("uniform1f", "u_zoom", this.zoom);
		this.getShader().setUniform("uniform1f", "u_rot", this.rotation);
		this.getShader().setUniform("uniform2fv", "u_pos", [this.pos.x, this.pos.y]);
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
export const starShader = new StarShader();
