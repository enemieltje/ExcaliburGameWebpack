import { PostProcessor, ScreenShader, Shader, VertexLayout } from "excalibur";
import shader from "./glsl/ErosionShader.glsl";

export class ErosionShader implements PostProcessor {
    private _shader?: ScreenShader;

    initialize(gl: WebGL2RenderingContext): void {
        this._shader = new ScreenShader(gl, shader);
    }

    getLayout(): VertexLayout {
        return this._shader!.getLayout();
    }

    getShader(): Shader {
        return this._shader!.getShader();
    }

    onUpdate?(elapsedMs: number): void {

    }
}
export const erosionShader = new ErosionShader();
