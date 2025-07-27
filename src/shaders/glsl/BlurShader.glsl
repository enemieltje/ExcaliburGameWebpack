#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform bool is_horizontal;

in vec2 v_uv;
out vec4 fragColor;

const int radius = 5; // blur radius
const float weights[11] = float[](0.06136, 0.09158, 0.12245, 0.14492, 0.15312, 0.15401, 0.15312, 0.14492, 0.12245, 0.09158, 0.06136);

vec2 blur(vec2 screencoord) {
    vec2 texel = is_horizontal ? vec2(1.0 / u_resolution.x, 0.0): vec2(0.0, 1.0 / u_resolution.y);
    // float sum = float(0.0);

    float blur_temperature = 0.;
    float blur_brightness = 0.;
    float max_brightness = 0.;

    for (int i = -radius; i <= radius; i++) {
        float w = weights[i + radius];
        vec4 image_sample = texture(u_image, v_uv + texel * float(i));

        float temperature = image_sample.r;
        float brightness = image_sample.g;
        bool is_background = image_sample.b == 1./255.;

        // Skip non background pixels
        if(!is_background) continue;

        // Skip non star pixels
        if (brightness < 0.01) continue;

        if(is_background)
            blur_brightness += brightness * w;

        if (brightness > max_brightness) {
            max_brightness = brightness;
            blur_temperature = temperature;
        }
    }

    return vec2(blur_temperature, blur_brightness);
}


void main() {
    vec2 v_screencoord = v_uv*u_resolution;
    vec4 tex=texture(u_image,v_uv);
    float temperature = tex.r;
    float brightness = tex.g;
    bool is_background = tex.b == 1./255.;

    vec2 blur_data = blur(v_screencoord);
    float blur_temperature = blur_data.r;
    float blur_brightness = blur_data.g;

    if(is_background && blur_brightness >= 0.01){
        fragColor = vec4(blur_temperature, blur_brightness, tex.b, 1.);
    }else{
        fragColor = tex;
    }

}
