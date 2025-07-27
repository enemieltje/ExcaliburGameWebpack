#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_gauss[40];

in vec2 v_uv;

out vec4 fragColor;

vec2 flare(vec2 screencoord) {

    float flare_temperature = 0.;
    float flare_brightness = 0.;
    float max_brightness = 0.;

    for (int dx = 0; dx <= u_gauss.length(); dx++) {
        for (int dy = 0; dy <= u_gauss.length(); dy++) {

            //sample the kernel
            float kernel_sample;
            float gx = u_gauss[dx];
            float gy = u_gauss[dy];

            // skip empty kernel pixels
            if (gx == 0.0 || gy == 0.0) continue;

            // sample the image
            vec2 offset = vec2(float(dx-(u_gauss.length()/2)), float(dy-(u_gauss.length()/2)));
            vec4 image_sample = texture(u_image, (screencoord + offset)/u_resolution);
            float temperature = image_sample.r;
            float brightness = image_sample.g;
            bool is_background = image_sample.b == 1./255.;

            // Skip non background pixels
            if(!is_background) continue;

            // Skip non star pixels
            if(brightness <= 0.01) continue;

            kernel_sample = 0.005 * (gx + gy) + 0.02 * (gx * gy);

            // Calculate Convolution
            flare_brightness += kernel_sample*brightness;

            // Calculate Color
            if (brightness>max_brightness){
                max_brightness = brightness;
                flare_temperature = temperature;
            }
        }
    }
    // return vec4(vec3(pixel_color), 1.);
    return vec2(flare_temperature, flare_brightness);
}

vec2 new_flare(vec2 screencoord) {

    float flare_temperature = 0.;
    float flare_brightness = 0.;
    float max_brightness = 0.;

    // Small radius loop: 9x9 or smaller
    int r = 9;
    for (int dx = -r; dx <= r; dx++) {
        for (int dy = -r; dy <= r; dy++) {
            vec2 offset = vec2(float(dx), float(dy));
            vec2 sampleUV = (screencoord + offset) / u_resolution;

            vec4 image_sample = texture(u_image, sampleUV);
            float brightness = image_sample.g;
            bool is_background = image_sample.b == 1./255.;

            // Skip non background pixels
            if(!is_background) continue;

            // Skip non star pixels
            if (brightness < 0.01) continue;

            float temperature = image_sample.r;

            float dist = length(offset);
            float weight = 2. / (1.0 + (dist * dist))/float(r); // inverse-square falloff
            // float weight = smoothstep(float(r/2), 0.0, dist);

            flare_brightness += brightness * weight;

            if (brightness > max_brightness) {
                max_brightness = brightness;
                flare_temperature = temperature;
            }
        }
    }
    return vec2(flare_temperature, flare_brightness);
}
void main() {
    vec2 v_screencoord = v_uv*u_resolution;
    vec4 tex = texture(u_image, v_uv);
    float temperature = tex.r;
    float brightness = tex.g;
    bool is_background = tex.b == 1./255.;
    // float sum=abs(tex.r-tex.b);
    vec2 flare_data = new_flare(v_screencoord);
    float flare_temperature = flare_data.r;
    float flare_brightness = flare_data.g;

    if(is_background && flare_brightness >= 0.01){
        fragColor = vec4(flare_temperature, flare_brightness, tex.b, 1.);
    }else{
        fragColor = tex;
    }
}
