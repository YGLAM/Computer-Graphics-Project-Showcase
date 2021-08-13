#version 300 es

precision mediump float;

in vec3 fs_normal;
in vec3 fs_position;
in vec2 fs_uv;

out vec4 outColor;

uniform vec3 dirDirection; // directional light direction vec

uniform vec3 pointPos; //point light position
uniform float pointTarget; //point light target
uniform float pointDecay; //point light decay

uniform vec3 mDiffColor; //material diffuse color
uniform vec3 directColor; //directional light color

uniform sampler2D u_texture;

void main() {
    //it is a point light color
    vec3 lightColorA = directColor * pow(pointTarget / length(pointPos - fs_position), pointDecay);//@101
    //it returns dirDirection as its light
    vec3 nNormal = normalize(fs_normal);//same with boat @182
    vec3 lightDirNorm = normalize(pointPos - fs_position);//same @81 @21
    // vec3 eyeDirNorm = normalize(lightPos - fs_position); ???
    vec3 lambertColor = mDiffColor * lightColorA * dot(lightDirNorm, nNormal);

    outColor = vec4(clamp(lambertColor, 0.0, 1.0),1.0) + texture(u_texture, fs_uv);

}
