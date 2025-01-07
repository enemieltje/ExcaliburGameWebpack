import { PostProcessor, ScreenShader, Shader, VertexLayout } from "excalibur";
import shader from "./glsl/OrbitShader.glsl"
import { OrbitData } from "@/utils/types";

class OrbitShader implements PostProcessor {
	private _shader?: ScreenShader;
	rotation = 0;
	zoom = 1;
	orbits: Record<string, OrbitData> = {};

	initialize(gl: WebGL2RenderingContext): void {
		this._shader = new ScreenShader(gl, shader);
	}

	getLayout(): VertexLayout {
		return this._shader!.getLayout();
	}

	getShader(): Shader {
		return this._shader!.getShader();
	}

	setOrbit(name: string, orbit: OrbitData) {
		this.orbits[name] = orbit;
	}

	onUpdate() {
		Object.values(this.orbits).forEach((orbit, i) => {
			if (i >= 20) return;
			this.getShader().setUniform(
				"uniform4fv",
				`u_orbit[${i}]`,
				[
					orbit.c.x,
					orbit.c.y,
					orbit.a,
					orbit.b,
				]
			);
			this.getShader().setUniform(
				"uniform1f",
				`u_rot[${i}]`,
				this.rotation - orbit.e.toAngle()
			);
		});
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
