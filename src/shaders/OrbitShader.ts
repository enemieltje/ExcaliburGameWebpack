import { PostProcessor, ScreenShader, Shader, VertexLayout } from "excalibur";
import shader from "./glsl/OrbitShader.glsl"
import { ShaderOrbit } from "@/utils/types";

class OrbitShader implements PostProcessor {
	private _shader?: ScreenShader;
	rotation = 0;
	zoom = 1;
	orbits: Record<string, ShaderOrbit> = {};

	initialize(gl: WebGL2RenderingContext): void {
		this._shader = new ScreenShader(gl, shader);
	}

	getLayout(): VertexLayout {
		return this._shader!.getLayout();
	}

	getShader(): Shader {
		return this._shader!.getShader();
	}

	setOrbit(name: string, orbit: ShaderOrbit) {
		this.orbits[name] = orbit;
	}

	clearOrbits() {
		// Object.values(this.orbits).forEach((orbit, i) => {
		// 	if (i >= 20) return;
		// 	this.getShader().setUniform(
		// 		"uniform4fv",
		// 		`u_orbit[${i}]`,
		// 		[0, 0, 0, 0,]
		// 	);
		// });
		this.orbits = {}

	}

	onUpdate() {
		const orbitArray = Object.values(this.orbits)
		for (let i = 0; i < 20; i++) {
			// Object.values(this.orbits).forEach((orbit, i) => {
			// if (i >= 20) return;
			const orbit = orbitArray[i]
			if (orbit) {
				this.getShader().setUniform(
					"uniform4fv",
					`u_orbit[${i}]`,
					[
						orbit.pos.x,
						orbit.pos.y,
						orbit.a,
						orbit.b,
					]
				);
				this.getShader().setUniform(
					"uniform1f",
					`u_rot[${i}]`,
					this.rotation - orbit.rotation
				);
			} else {
				this.getShader().setUniform(
					"uniform4fv",
					`u_orbit[${i}]`,
					[0, 0, 0, 0,]
				);
				this.getShader().setUniform(
					"uniform1f",
					`u_rot[${i}]`,
					0
				);
			}
		};
		this.getShader().setUniform("uniform1f", "u_zoom", this.zoom);
	}

	setRotation(rotation: number) {
		this.rotation = rotation;
		return this;
	}

	setZoom(zoom: number) {
		this.zoom = zoom;
		return this;
	}
}

export const orbitShader = new OrbitShader();
