#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform vec2 u_resolution;

in vec2 v_uv;

out vec4 fragColor;


vec4 erode(vec2 screencoord) {

    vec4 minVal = vec4(0.988, 0.988, 0.992, 1.);
    int kernelRadius = 4;

    for (int dx = -kernelRadius; dx <= kernelRadius; dx++) {
        for (int dy = -kernelRadius; dy <= kernelRadius; dy++) {
            vec2 offset = vec2(float(dx), float(dy));
            // Only sample within the circular radius
            if (length(offset) <= float(kernelRadius)) {
                vec4 v_tex = texture(u_image, (screencoord + offset)/u_resolution);
                float sum = v_tex.r - v_tex.b;
                // float v_sample = texture(u_image, (screencoord + offset)/u_resolution).r;
                // minVal = min(minVal, v_sample);
                if(0.0038<=sum && sum<=0.004)
                    // return 0.01;
                    minVal = vec4(0.012,0.012,0.008,1.);
            }
        }
    }
    return minVal;
    // return 0.9;
}

bool is_background(vec4 tex){
    return tex.b == 1./255.;
}

void main() {
    vec2 v_screencoord = v_uv*u_resolution;
    vec4 tex = texture(u_image, v_uv);
    // float sum=tex.r+tex.g+tex.b;
    float sum=abs(tex.r-tex.b);


    if(0.0038<=sum && sum<=0.004){
        fragColor = erode(v_screencoord);
    }else{
        fragColor = tex;
    }
}
