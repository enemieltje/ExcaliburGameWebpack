#version 300 es
precision mediump float;

// our texture
uniform sampler2D u_screen_texture;
uniform vec2 u_resolution;
uniform float u_gauss[40];
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

float perlin_noise(vec2 screencoord){
    return snoise(screencoord/20.);
}

float perlin_threshold(vec2 screencoord, float threshold){
    float noise = perlin_noise(screencoord);
    if (noise>=threshold)
        return noise;
    else
        return 0.;
}

float dilated_perlin(vec2 screencoord, float threshold, int kernelRadius) {

    // int kernelRadius = 3;

    for (int dx = -kernelRadius; dx <= kernelRadius; dx++) {
        for (int dy = -kernelRadius; dy <= kernelRadius; dy++) {
            vec2 offset = vec2(float(dx), float(dy));
            // Only sample within the circular radius
            if (length(offset) <= float(kernelRadius)) {

                float image_sample = perlin_threshold(screencoord + offset, threshold);

                if(image_sample>0.)
                    return 1.;
            }
        }
    }
    // return maxVal;
    return 0.0;
}

float flare(vec2 screencoord, float threshold, int kernelRadius) {

    float pixel_color = 0.;

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
            float image_sample = dilated_perlin(screencoord + offset, threshold, kernelRadius);

            // skip non star pixels
            if(image_sample==0.) continue;

            kernel_sample = 0.005 * (gx + gy) + 0.02 * (gx * gy);

            // Calculate Convolution
            pixel_color += kernel_sample*image_sample;

        }
    }
    // return vec4(vec3(pixel_color), 1.);
    return pixel_color;
}

void main(){
    // fragColor = vec4(0.9);
    vec2 v_worldcoord;

    v_worldcoord = (u_transmat * vec3(v_uv, 1.)).xy;
    // v_worldcoord = v_uv*u_resolution;
    v_worldcoord = floor(v_worldcoord);

    float big_stars = flare(v_worldcoord, 0.99, 6);
    // float mid_stars = dilated_perlin(v_worldcoord, 0.98, 3);
    // float low_stars = dilated_perlin(v_worldcoord, 0.96, 1);


    float pos_noise = perlin_noise(v_worldcoord);
    // fragColor = vec4(big_stars+mid_stars+low_stars);
    fragColor = vec4(big_stars);
}

