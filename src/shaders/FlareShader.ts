import { PostProcessor, ScreenShader, Shader, VertexLayout } from "excalibur";
import shader from "./glsl/FlareShader.glsl";

export class FlareShader implements PostProcessor {
    private _shader?: ScreenShader;
    gauss: number[] = new Array(40).fill(0);

    constructor(size: number) {
        // https://www.desmos.com/calculator/wy0a0jumf5
        for (let i = 1; i < size * 2; i++) {
            this.gauss[this.gauss.length / 2 - size + i] =
                Math.exp(-(
                    ((i - size) ** 2) /
                    (2 * ((size / 5) ** 2))
                ))
        }
        // console.debug(this.gauss)
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
        // this.getShader().setUniform("uniform1fv", "u_gauss", this.gauss)

    }
}
// export const flareShader = new FlareShader();
export const flareShader = (size: number) => new FlareShader(size);
