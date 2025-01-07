#version 300 es
precision mediump float;

// our texture
uniform sampler2D u_image;
uniform vec2 u_resolution;

uniform float u_rot[20];// angle of orbit
uniform vec4 u_orbit[20];// pos, a, b of orbit
uniform float u_zoom;

// the texCoords passed in from the vertex shader.
in vec2 v_texcoord;

out vec4 fragColor;

float get_ellipse(vec2 v_pos,float f_rot,float f_a,float f_b){

    vec2 v_ell;
    v_ell.x=v_pos.x*cos(f_rot)-v_pos.y*sin(f_rot);
    v_ell.y=v_pos.x*sin(f_rot)+v_pos.y*cos(f_rot);

    float f_ell=
    (v_ell.x*v_ell.x/(f_a*f_a))+
    (v_ell.y*v_ell.y/(f_b*f_b))-1.;

    f_ell=1.-(abs(f_ell)*f_a/5.);

    if(f_ell<0.){
        f_ell=0.;
    }

    return f_ell;
}

void main(){

    vec2 v_screencoord;
    v_screencoord.x=v_texcoord.x*u_resolution.x;
    v_screencoord.y=(1.-v_texcoord.y)*u_resolution.y;

    vec2 v_pos;
    float f_ell=0.;
    int i;

    for(i=0;i<u_orbit.length();i++){
        v_pos.x=v_screencoord.x-u_orbit[i].x;
        v_pos.y=v_screencoord.y-u_orbit[i].y;
        f_ell+=get_ellipse(v_pos,u_rot[i],u_orbit[i].z * u_zoom,u_orbit[i].w * u_zoom);
    }

    vec4 tex=texture(u_image,v_texcoord);
    float sum=tex.r+tex.g+tex.b;
    if(sum<.5) fragColor=vec4(tex.r-f_ell,tex.g-f_ell ,tex.b+f_ell,1.);
    else fragColor=vec4(tex.r,tex.g,tex.b,1.);
}
