// import { Color, ExcaliburGraphicsContextWebGL, Vector, RendererPlugin } from "excalibur";
// import * as ex from 'excalibur';
// // import RendererPlugin from "excalibur"
// export class MultiPassRenderer implements ex.RendererPlugin {
//     public readonly type = 'multi-pass-renderer';
//     public priority: number = 0;

//     private _gl: WebGL2RenderingContext;
//     private _context: ex.ExcaliburGraphicsContextWebGL;

//     private _fbo: WebGLFramebuffer;
//     private _tex: WebGLTexture;
//     private _shaderPass1: ex.Shader;
//     private _shaderPass2: ex.Shader;
//     private _quadBuffer: ex.VertexBuffer;
//     private _quadLayout: ex.VertexLayout;

//     initialize(gl: WebGL2RenderingContext, context: ex.ExcaliburGraphicsContextWebGL): void {
//         this._gl = gl;
//         this._context = context;

//         // 1. Create shader programs
//         this._shaderPass1 = new ex.Shader({
//             gl,
//             vertexSource: "fullscreenVertexShader",
//             fragmentSource: "dilationFragmentShader"
//         });

//         this._shaderPass2 = new ex.Shader({
//             gl,
//             vertexSource: "fullscreenVertexShader",
//             fragmentSource: "passthroughFragmentShader"
//         });

//         this._shaderPass1.compile();
//         this._shaderPass2.compile();

//         // 2. Create framebuffer + texture
//         const width = gl.drawingBufferWidth;
//         const height = gl.drawingBufferHeight;

//         this._tex = gl.createTexture();
//         gl.bindTexture(gl.TEXTURE_2D, this._tex);
//         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
//         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

//         this._fbo = gl.createFramebuffer();
//         gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
//         gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._tex, 0);

//         // 3. Setup fullscreen quad
//         this._quadBuffer = new ex.VertexBuffer({
//             gl,
//             size: 4 * 4, // 2 pos, 2 uv per vertex
//             type: 'static'
//         });

//         const vertices = new Float32Array([
//             -1, -1, 0, 0,
//             1, -1, 1, 0,
//             -1, 1, 0, 1,
//             1, 1, 1, 1
//         ]);
//         this._quadBuffer.bufferData.set(vertices);

//         this._quadLayout = new ex.VertexLayout({
//             gl,
//             shader: this._shaderPass1,
//             vertexBuffer: this._quadBuffer,
//             attributes: [
//                 ['a_position', 2],
//                 ['a_uv', 2]
//             ]
//         });
//     }

//     hasPendingDraws(): boolean {
//         return true; // always draw (you can control this if needed)
//     }

//     draw(): void {
//         // no-op: we draw in flush
//     }

//     flush(): void {
//         const gl = this._gl;
//         const { width, height } = gl.canvas;

//         // === Pass 1: Render with dilation shader to FBO ===
//         gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
//         gl.viewport(0, 0, width, height);
//         gl.clear(gl.COLOR_BUFFER_BIT);

//         this._shaderPass1.use();
//         this._shaderPass1.setUniformFloatVector('u_resolution', ex.vec(width, height));

//         this._quadLayout.shader = this._shaderPass1;
//         this._quadLayout.use(false);
//         gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

//         // === Pass 2: Render FBO texture to screen ===
//         gl.bindFramebuffer(gl.FRAMEBUFFER, null);
//         gl.viewport(0, 0, width, height);
//         gl.clear(gl.COLOR_BUFFER_BIT);

//         this._shaderPass2.use();
//         // this._shaderPass2.setUniformTexture('u_image', this._tex, 0);
//         this._shaderPass2.setTexture(0, this._tex);

//         this._quadLayout.shader = this._shaderPass2;
//         this._quadLayout.use(false);
//         gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
//     }
//     dispose(): void {
//         // throw new Error("Method not implemented.");
//     }
// }

