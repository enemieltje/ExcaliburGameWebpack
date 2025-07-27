import { PostProcessor, ScreenShader, Shader, VertexLayout } from "excalibur";
import shader from "./glsl/StreakShader.glsl";

export class StreakShader implements PostProcessor {
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
export const streakShader = new StreakShader();
// export const streakShader = (is_horizontal: boolean) => new StreakShader(is_horizontal);
