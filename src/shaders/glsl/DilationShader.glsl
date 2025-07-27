#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_zoom;

in vec2 v_uv;

out vec4 fragColor;


float dilate(vec2 screencoord) {

    // vec4 maxVal = vec4(0.012,0.012,0.008,1.);
    // int kernelRadius = int(3.*u_zoom);
    int kernelRadius = 3;

    for (int dx = -kernelRadius; dx <= kernelRadius; dx++) {
        for (int dy = -kernelRadius; dy <= kernelRadius; dy++) {
            vec2 offset = vec2(float(dx), float(dy));
            // Only sample within the circular radius
            if (length(offset) <= float(kernelRadius)) {
                vec4 tex = texture(u_image, (screencoord + offset)/u_resolution);
                float temperature = tex.r;
                float brightness = tex.g;
                bool is_background = tex.b == 1./255.;
                if(!is_background) continue;

                if(brightness == 1.)
                    return 1.;
                    // maxVal = vec4(0.988, 0.988, 0.992, 1.);
            }
        }
    }
    return 0.;
    // return 0.01;
}

void main() {
    vec2 v_screencoord = v_uv*u_resolution;
    vec4 tex = texture(u_image, v_uv);
    // float sum=tex.r+tex.g+tex.b;
    // float sum=abs(tex.r-tex.b);
    float temperature = tex.r;
    float brightness = tex.g;
    bool is_background = tex.b == 1./255.;

    // if((0.03<=sum && sum<=0.036) || (2.67<=sum && sum<=2.7)){
    if(is_background){
        fragColor = vec4(tex.r, max(brightness, dilate(v_screencoord)), tex.b, 1.);
    }else{
        fragColor = tex;
    }
}
