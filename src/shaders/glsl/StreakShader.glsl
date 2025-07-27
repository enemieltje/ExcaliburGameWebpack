#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform vec2 u_resolution;

in vec2 v_uv;
out vec4 fragColor;

const int radius = 32;
const float weights[65] = float[](
    0.000225, 0.000362, 0.000573, 0.000895, 0.001367, 0.002034, 0.002947, 0.004161,
    0.005735, 0.007738, 0.010245, 0.013332, 0.017071, 0.021531, 0.026765, 0.032810,
    0.039678, 0.047351, 0.055773, 0.064847, 0.074436, 0.084368, 0.094439, 0.104421,
    0.114070, 0.123144, 0.131413, 0.138672, 0.144748, 0.149508, 0.152869, 0.154801,
    0.155317, 0.154401, 0.152087, 0.148449, 0.143602, 0.137685, 0.130858, 0.123295,
    0.115184, 0.106718, 0.098090, 0.089482, 0.081059, 0.072962, 0.065306, 0.058173,
    0.051610, 0.045637, 0.040252, 0.035433, 0.031143, 0.027336, 0.023961, 0.020962,
    0.018281, 0.015865, 0.013667, 0.011647, 0.009769, 0.007999, 0.006308, 0.004672,
    0.003069
);
// Direction vectors (in UV space)
vec2 toUV(vec2 dir) {
    return dir / u_resolution;
}

vec2 streak() {


    // vec4 streak = vec4(0.0);
    vec2 dirs[4] = vec2[4](
        toUV(vec2(1.0, 0.0)),   // horizontal
        toUV(vec2(0.0, 1.0)),   // vertical
        toUV(vec2(1.0, 1.0)),   // diagonal
        toUV(vec2(-1.0, 1.0))   // cross-diagonal
    );

    float streak_temperature = 0.;
    float streak_brightness = 0.;
    float max_brightness = 0.;

    for (int d = 0; d < 2; d++) {
        vec2 dir = dirs[d];
        for (int i = -radius; i <= radius; i++) {
            float w = weights[i + radius];
            vec2 offset = dir * float(i);
            vec4 image_sample = texture(u_image, v_uv + offset);


            float temperature = image_sample.r;
            float brightness = image_sample.g;
            bool is_background = image_sample.b == 1./255.;

            // Skip non background pixels
            if(!is_background) continue;

            // Skip non star pixels
            if (brightness < 0.01) continue;

            if(is_background)
                streak_brightness += brightness * w;

            if (brightness > max_brightness) {
                max_brightness = brightness;
                streak_temperature = temperature;
            }
        }
    }

    return vec2(streak_temperature, streak_brightness/3.0);
}

void main() {
    vec4 tex=texture(u_image,v_uv);
    float temperature = tex.r;
    float brightness = tex.g;
    bool is_background = tex.b == 1./255.;

    vec2 streak_data = streak();
    float streak_temperature = streak_data.r;
    float streak_brightness = streak_data.g;

    if(is_background && streak_brightness >= 0.01){
        fragColor = vec4(streak_temperature, streak_brightness, tex.b, 1.);
    }else{
        fragColor = tex;
    }
}
