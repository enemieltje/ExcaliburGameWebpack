#version 300 es
precision mediump float;

// our texture
uniform sampler2D u_image;
// uniform vec2 u_resolution;
// uniform float u_rot;
// uniform vec2 u_pos;
// uniform float u_zoom;
uniform float u_threshold;
uniform mat3 u_transmat;

// the texCoords passed in from the vertex shader.
in vec2 v_uv;

out vec4 fragColor;

// https://www.desmos.com/calculator/b4qgzzxzx6
float bbr(float value, float scale, float pos){
    float a = value/scale - pos;
    return -2.7*a*exp(a);
}

vec3 getColor(float temp){
    vec3 color;
    color.r = bbr(temp, 0.7, 1.6);
    color.g = bbr(temp, 0.4, 2.7);
    color.b = bbr(temp, 0.25, 5.);
    return color;
}

bool is_background(vec4 tex){
    return tex.b == 1./255.;
}

void main(){
    vec2 v_worldcoord;

    v_worldcoord = (u_transmat * vec3(v_uv, 1.)).xy;
    v_worldcoord = floor(v_worldcoord);


    vec4 tex = texture(u_image, v_uv);

    float temperature = tex.r;
    float brightness = tex.g;
    bool is_background = tex.b == 1./255.;


    if(is_background){
        fragColor = vec4(getColor(temperature)*brightness, 1.);
    }else{
        fragColor = tex;
    }
    // fragColor = tex;
    // fragColor = getColor(color_noise);
}

