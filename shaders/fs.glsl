#version 300 es

precision mediump float;

in vec3 fs_normal;
in vec3 fs_position;
in vec2 fs_uv;

out vec4 outColor;

uniform vec3 lightDirection; // directional light direction vec

uniform vec3 lightPos; //point light position
uniform float lightTarget; //point light target
uniform float lightDecay; //point light decay

uniform vec3 mDiffColor; //material diffuse color 
uniform vec3 lightColor; //directional light color 

uniform sampler2D u_texture;

void main() {
    vec3 lightColorA = lightColor * pow(lightTarget / length(lightPos - fs_position), lightDecay);

    vec3 nNormal = normalize(fs_normal);
    vec3 lightDirNorm = normalize(lightPos - fs_position);
    // vec3 eyeDirNorm = normalize(lightPos - fs_position); ???
    vec3 lambertColor = mDiffColor * lightColorA * dot(lightDirNorm, nNormal);

    outColor = vec4(clamp(lambertColor, 0.0, 1.0),1.0) + texture(u_texture, fs_uv);

}
    // vec3 lightDirNorm = normalize(lightDirection);
    // vec3 nNormal = normalize(fs_normal);
    // vec3 lambertColor = mDiffColor * lightColor * dot(-lightDirNorm,nNormal);
    // outColor = vec4(clamp(lambertColor, 0.0, 1.0),1.0) + texture(u_texture, fs_uv);