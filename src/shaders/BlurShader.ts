import { PostProcessor, ScreenShader, Shader, VertexLayout } from "excalibur";
import shader from "./glsl/BlurShader.glsl";

export class BlurShader implements PostProcessor {
    private _shader?: ScreenShader;
    is_horizontal = true;

    constructor(is_horizontal: boolean) {
        this.is_horizontal = is_horizontal;
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

    onUpdate?(elapsedMs: number): void {
        this.getShader().setUniformBoolean("is_horizontal", this.is_horizontal)

    }
}
export const blurShader = (is_horizontal: boolean) => new BlurShader(is_horizontal);
