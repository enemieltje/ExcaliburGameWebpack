import { Matrix, PostProcessor, ScreenShader, Shader, vec, Vector, VertexLayout } from "excalibur";
import shader from "./glsl/ColorShader.glsl";

export class ColorShader implements PostProcessor {
    private _shader?: ScreenShader;
    resolution = vec(800, 600);
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

    onUpdate?(elapsedMs: number): void {


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
export const colorShader = new ColorShader();
