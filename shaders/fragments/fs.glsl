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
uniform vec3 dirColor; //directional light color

uniform sampler2D u_texture;

/*vec3 compLightDir(vec3 LPos, vec3 LDir, vec4 lightType) {
	//lights
	// -> Point
	vec3 pointLightDir = normalize(LPos - fs_pos);
	// -> Direct
	vec3 directLightDir = LDir;
	// -> Spot
	vec3 spotLightDir = normalize(LPos - fs_pos);

	return            directLightDir * lightType.x +
					  pointLightDir * lightType.y +
					  spotLightDir * lightType.z;//using onehot notation
}*/

void main() {
    vec3 lightColorA = dirColor * pow(pointTarget / length(pointPos - fs_position), pointDecay);

    vec3 nNormal = normalize(fs_normal);
    vec3 lightDirNorm = normalize(pointPos - fs_position);
    // vec3 eyeDirNorm = normalize(lightPos - fs_position); ???
    vec3 lambertColor = mDiffColor * lightColorA * dot(lightDirNorm, nNormal);

    outColor = vec4(clamp(lambertColor, 0.0, 1.0),1.0) + texture(u_texture, fs_uv);

}