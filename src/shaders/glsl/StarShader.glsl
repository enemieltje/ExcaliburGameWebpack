#version 300 es
precision mediump float;

// our texture
uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_rot;
uniform vec2 u_pos;
uniform float u_zoom;

// the texCoords passed in from the vertex shader.
in vec2 v_texcoord;

out vec4 fragColor;

vec3 mod289(vec3 x){
    return x-floor(x*(1./289.))*289.;
}

vec2 mod289(vec2 x){
    return x-floor(x*(1./289.))*289.;
}

vec3 permute(vec3 x){
    return mod289(((x*34.)+10.)*x);
}

float snoise(vec2 v)
{
    const vec4 C=vec4(
        .211324865405187,
        .366025403784439,
        -.577350269189626,
        .024390243902439
    );

    // First corner
    vec2 i=floor(v+dot(v,C.yy));
    vec2 x0=v-i+dot(i,C.xx);

    // Other corners
    vec2 i1;
    i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
    vec4 x12=x0.xyxy+C.xxzz;
    x12.xy-=i1;

    // Permutations
    i=mod289(i);// Avoid truncation effects in permutation
    vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))
    +i.x+vec3(0.,i1.x,1.));

    vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
    m=m*m;
    m=m*m;

    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

    vec3 x=2.*fract(p*C.www)-1.;
    vec3 h=abs(x)-.5;
    vec3 ox=floor(x+.5);
    vec3 a0=x-ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt( a0*a0 + h*h );
    m*=1.79284291400159-.85373472095314*(a0*a0+h*h);

    // Compute final noise value at P
    vec3 g;
    g.x=a0.x*x0.x+h.x*x0.y;
    g.yz=a0.yz*x12.xz+h.yz*x12.yw;
    return .5+.5*(130.*dot(m,g));
}

vec2 rotate(vec2 v_in,float angle){
    vec2 v_out;
    v_out.x=v_in.x*cos(angle)-(v_in.y*sin(angle));
    v_out.y=v_in.x*sin(angle)+(v_in.y*cos(angle));
    return v_out;
}

// https://www.desmos.com/calculator/b4qgzzxzx6
float bbr(float value, float scale, float pos){
    float a = value/scale - pos;
    return -2.7*a*exp(a);
}

vec4 getColor(float temp){
    vec4 color;
    color.r = bbr(temp, 0.7, 1.6);
    color.g = bbr(temp, 0.4, 2.7);
    color.b = bbr(temp, 0.25, 5.);
    color.w = 1.;
    return color;
}

void drawStar(float pos_noise, float color_noise){
    vec4 color = getColor(color_noise);
    if(pos_noise>.98){
        fragColor+=color;
    }else fragColor=vec4(0,0,0,1.);
    // fragColor=color;
}

void main(){
    float scale = exp(floor(log(u_zoom)));
    vec2 v_worldcoord;
    v_worldcoord.x=v_texcoord.x*u_resolution.x;
    v_worldcoord.y=(1.-v_texcoord.y)*u_resolution.y; // pixels on screen
    v_worldcoord-=u_pos; // pixels on cam pos
    v_worldcoord=v_worldcoord/u_zoom; // pixels with cam zoom
    v_worldcoord=rotate(v_worldcoord,u_rot); // pixels with cam rotation
    v_worldcoord=floor(v_worldcoord);

    float pos_noise=snoise(v_worldcoord/8.*scale);
    float color_noise=snoise(v_worldcoord/30.*scale);

    vec4 tex=texture(u_image,v_texcoord);
    float sum=tex.r+tex.g+tex.b;

    if(sum<.5) drawStar(pos_noise,color_noise);
    else fragColor=vec4(tex.r,tex.g,tex.b,1.);
}

