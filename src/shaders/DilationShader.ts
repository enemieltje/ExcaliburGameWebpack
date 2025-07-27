import { PostProcessor, ScreenShader, Shader, VertexLayout } from "excalibur";
import shader from "./glsl/DilationShader.glsl";

export class DilationShader implements PostProcessor {
    private _shader?: ScreenShader;
    zoom = 1;


    initialize(gl: WebGL2RenderingContext): void {
        this._shader = new ScreenShader(gl, shader);
    }

    getLayout(): VertexLayout {
        return this._shader!.getLayout();
    }

    getShader(): Shader {
        return this._shader!.getShader();
    }

    setZoom(zoom: number) {
        this.zoom = zoom;
        return this;
    }

    onUpdate?(elapsedMs: number): void {
        // this.getShader().setUniform("uniform1f", "u_zoom", this.zoom);

    }
}
export const dilationShader = new DilationShader();
