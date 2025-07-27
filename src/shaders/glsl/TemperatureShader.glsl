#version 300 es
precision mediump float;

// our texture
uniform sampler2D u_image;
uniform vec2 u_resolution;
// uniform float u_rot;
// uniform vec2 u_pos;
// uniform float u_zoom;
uniform float u_threshold;
uniform mat3 u_transmat;

// the texCoords passed in from the vertex shader.
in vec2 v_uv;

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

void main(){
    vec2 v_worldcoord;

    v_worldcoord = (u_transmat * vec3(v_uv, 1.)).xy;
    // v_worldcoord = floor(v_worldcoord);

    float zoom = u_resolution.x/length(vec2(u_transmat[0][0], u_transmat[1][0]));

    float scale = exp(floor(log(zoom)));

    float temperature=snoise(v_worldcoord/30.*scale);

    vec4 tex = texture(u_image, v_uv);
    // float temperature = tex.r;
    float brightness = tex.g;
    bool is_background = tex.b == 1./255.;


    if(is_background){
        fragColor = vec4(temperature, tex.g, tex.b, 1.);
        // fragColor = vec4(vec2(temperature), tex.b, 1.);
    }else{
        fragColor = tex;
    }
}

