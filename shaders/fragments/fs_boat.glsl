#version 300 es

precision mediump float;


//uniform vec3 mDiffColor; //material diffuse color
//uniform vec3 directColor; //directional light color
in vec3 fs_position;
in vec3 fs_normal;
in vec2 fs_uv;

out vec4 outColor;
uniform vec4 colour;
uniform sampler2D u_texture;

uniform vec3 eyePosition;

// Help variables
uniform float lightType;
uniform float lightAmbient;
uniform float lightDiffuse;
uniform float lightSpecular;

// Colors
uniform vec4 directColor;
uniform vec4 pointColor;
uniform vec4 spotColor;
uniform vec4 ambientColor;
uniform vec4 ambientLowerColor;
uniform vec4 ambientUpperColor;
uniform vec4 ambientRightColor;
uniform vec4 ambientLeftColor;
uniform vec4 lambertColor;
uniform vec4 lambertEmission;
uniform vec4 toonColor;
uniform vec4 toonEmission;
uniform vec4 phongColor;
uniform vec4 blinnColor;
uniform vec4 toonPColor;
uniform vec4 toonBColor;

//
// Other variables
//

// Direct
uniform vec3 dirDirection;// directional light direction vec

// Point
uniform vec3 pointPos;//point light position
uniform float pointDecay;
uniform float pointTarget;//point light target

// Spot
uniform float spotPosY;
uniform float spotDecay;
uniform float spotTargetG;
uniform vec3 spotDir;
uniform float spotConeIn;
uniform float spotConeOut;

// Hemispheric
uniform vec3 hemisphericDir;

// Lambert
uniform float lambertTexture;

// Toon
uniform float toonTexture;
uniform float toonThr;

// Specular
uniform float phongShiny;
uniform float blinnShiny;
uniform float toonPThr;
uniform float toonBThr;

// Compute light direction
vec3 computeLightDir(vec3 sPos, vec3 pPos, vec3 Dir, float lType) {
  if (lType == 0.0) {
    // Direct
    return Dir;
  } else if (lType == 1.0) {
    // Point
    return normalize(pPos - fs_position);
  } else if (lType == 2.0) {
    // Spot
    return normalize(sPos - fs_position);
  } else {
    return Dir;
  }
}

// Compute light color
vec4 computeLightColor(vec4 dColor, vec4 sColor, vec4 pColor, float pDecay, vec3 pPos, float sDecay, vec3 spotPosition, float sConeIn, float sConeOut, vec3 dir, float lType) {
  if (lType == 0.0) {
    // Direct
    return dColor;
  } else if (lType == 1.0) {
    // Point
    return pColor * pow(pointTarget / length(pPos - fs_position), pDecay);
  } else if (lType == 2.0) {
    // Spot
    vec3 spotLightDir = normalize(spotPosition - fs_position);
    float cosAngle = dot(spotLightDir, spotDir);
    return sColor * pow(spotTargetG/length(spotPosition - fs_position), sDecay) * clamp(((cosAngle - sConeOut) / (sConeIn - sConeOut)), 0.0, 1.0);
    } else {
    return dColor * vec4(0.0, 0.0, 0.0, 1.0);
  }
}

// Compute diffuse light
vec4 computeDiffuse(vec3 lightDirection, vec4 lightColor, vec3 nVec, vec4 diffLColor, vec4 diffTColor, vec3 eyeVec, float lightDiffuse) {
    float dotN = clamp(dot(nVec, lightDirection), 0.0, 1.0);
  if (lightDiffuse == 0.0) {
    vec4 col = lightColor * diffLColor;
    // Lambert
    return dotN * col;
  } else if (lightDiffuse == 1.0) {
    // Toon
    vec4 col = lightColor * diffTColor;
    return max(sign(dotN- toonThr), 0.0) * col;
    float temp = (dot(lightDirection, nVec));
    if (temp > toonThr) {
      return 0.0 * diffTColor * lightColor;
    } else {
      return diffTColor * lightColor;
    }
  } else {
    // None
    return vec4(0.0, 0.0, 0.0, 1.0);
  }
}

// Compute ambient light
vec4 computeAmbient(vec4 ambColor, vec3 normalVec, float type, vec3 lightDir) {
  if (type == 0.0) {
    // Ambient
    return ambColor * ambientColor;
  } else if (type == 1.0) {
    // Hemispheric
    float blend = (dot(normalVec, hemisphericDir) +1.0) / 2.0;
    return (ambientUpperColor * blend + ambientLowerColor * (1.0 - blend)) * ambColor;
  } else {
    // None
    return vec4(0.0, 0.0, 0.0, 1.0);
  }
}

// Compute specular light
vec4 computeSpecular(vec3 lightDir, vec4 lightCol, vec3 normalVec, vec3 eyeDir, float type) {
  float dotN = clamp(dot(normalVec, lightDir), 0.0, 1.1);
  vec3 ref = -reflect(lightDir, normalVec);
  float dotR = clamp(dot(ref, eyeDir), 0.0, 1.0);
  vec3 halfVec = (normalize(lightDir + eyeDir));
  float hDotN = clamp(dot(normalVec, halfVec), 0.0, 1.0);
  if (type == 0.0) {
    // Phong
    return lightCol * phongColor * max(sign(dotN), 0.0) * pow(dotR, phongShiny);
  } else if (type == 1.0) {
    // Blinn
    return lightCol * blinnColor * max(sign(dotN), 0.0) * pow(hDotN, blinnShiny);
  } else if (type == 2.0) {
    // Toon Phong
    return max(sign(dotR - toonPThr), 0.0) * lightCol * toonPColor * max(sign(dotN), 0.0);
  } else if (type == 3.0) {
    // Toon Blinn
    return max(sign(hDotN - toonBThr), 0.0) * lightCol * toonBColor * max(sign(dotN), 0.0);
  }
  else {
    return vec4(0.0, 0.0, 0.0, 0.0);
  }
}

void main() {

 // Initial Spot position for boat 1
 vec3 spotPosition = vec3(-865, -615, -260);
 vec3 finalSpotPosition = spotPosition + vec3(0.0, spotPosY*1.0, 0.0);

 vec3 nEyeDirection = normalize(eyePosition - fs_position);
 vec3 nNormal = normalize(fs_normal);
 vec4 textureColor = texture(u_texture, fs_uv);

 vec4 diffLColor = lambertColor * (1.0 - lambertTexture) + textureColor * (lambertTexture);
 vec4 diffTColor = toonColor * (toonTexture) + textureColor * (1.0 - toonTexture);
 vec4 ambientMatColor = ambientColor * 0.2 + textureColor * 0.8;

 vec3 lightDir = computeLightDir(finalSpotPosition, pointPos, dirDirection, lightType);
 vec4 lightCol = computeLightColor(directColor,spotColor, pointColor, pointDecay, pointPos, spotDecay, finalSpotPosition, spotConeIn/100.0, spotConeOut, lightDir, lightType);

 vec4 diffuse = computeDiffuse(lightDir, lightCol, nNormal, diffLColor, diffTColor, nEyeDirection, lightDiffuse);

 vec4 ambient = computeAmbient(ambientMatColor, nNormal, lightAmbient, lightDir);

 vec4 specular = computeSpecular(lightDir, lightCol, nNormal, nEyeDirection, lightSpecular);

  outColor = clamp(diffuse + ambient + specular, 0.0, 1.0);
  outColor = vec4(outColor.rgb, 1.0);
}
