#version 300 es

precision mediump float;

in vec3 fs_position;
in vec3 fs_normal;
in vec2 fs_uv;

out vec4 outColor;
uniform vec4 colour;
uniform sampler2D u_texture;

uniform vec3 eyePosition;

// Help variables
uniform float lightType;
uniform float lightAmbientType;
uniform float lightDiffuseType;
uniform float lightSpecularType;

// Direct
uniform vec4 directColor;
uniform vec3 dirDirection;

// Point
uniform vec4 pointColor;
uniform vec3 pointPosition;
uniform float pointDecay;
uniform float pointTarget;

// Spot
uniform vec4 spotColor;
uniform vec3 spotPosition;
uniform float initialSpotY;
uniform float spotDecay;
uniform float spotTarget;
uniform vec3 spotDir;
uniform float spotConeIn;
uniform float spotConeOut;
// Ambient
uniform vec4 ambientColor;
uniform vec4 ambientLowerColor;
uniform vec4 ambientUpperColor;
uniform vec4 ambientRightColor;
uniform vec4 ambientLeftColor;
// Hemispheric
uniform vec3 hemisphericDir;

// Lambert
uniform vec4 lambertColor;
uniform vec4 lambertEmission;
uniform float lambertTexture;

// Toon
uniform vec4 toonColor;
uniform vec4 toonEmission;
uniform float toonTexture;
uniform float toonThr;
//Oren Nayar
uniform vec4 orenColor;
uniform float orenTexture;
uniform float orenRoughness;
// Phong
uniform vec4 phongColor;
uniform float phongShiny;
// Blinn
uniform vec4 blinnColor;
uniform float blinnShiny;
// Toon Phong Specular
uniform vec4 toonPColor;
uniform float toonPThr;
// Toon Blinn Specular
uniform vec4 toonBColor;
uniform float toonBThr;

// Compute light direction
//computeLightDir(finalSpotPosition, pointPosition, dirDirection, lightType);
vec3 computeLightDir(vec3 spot_position, vec3 point_position, vec3 Dir, float lType) {
  if (lType == 0.0) {
    // Direct
    return Dir;
  } else if (lType == 1.0) {
    // Point
    return normalize(point_position - fs_position);
  } else if (lType == 2.0) {
    // Spot
    return normalize(spot_position - fs_position);
  } else {
    return Dir;
  }
}

// Compute light color
//computeLightColor(directColor,spotColor, pointColor, pointDecay, pointPosition, spotDecay, finalSpotPosition, spotConeIn/100.0, spotConeOut, lightDir, lightType);
vec4 computeLightColor(vec4 dColor, vec4 spotColor, vec4 pointColor, float pDecay, vec3 pPos, float lDecay, vec3 spot_position, float lConeIn, float lConeOut, vec3 dir, float lType) {
  if (lType == 0.0) {
    // Direct
    return dColor;
  } else if (lType == 1.0) {
    // Point
    return pointColor * pow(pointTarget / length(pPos - fs_position), pDecay);
  } else if (lType == 2.0) {
    // Spot
    float LCosOut = cos(radians(lConeOut / 2.0));
    float LCosIn = cos(radians(lConeOut * lConeIn / 2.0));
    vec3 spotLightDir = normalize(spotPosition - fs_position);
    float cosAngle = dot(spotLightDir, spotDir);
    return spotColor * pow(spotTarget/length(spot_position - fs_position), lDecay) * clamp(((cosAngle - LCosOut) / (LCosIn - LCosOut)), 0.0, 1.0);
    } else {
    return dColor * vec4(0.0, 0.0, 0.0, 1.0);
  }
}

// Compute diffuse light
//computeDiffuse(lightDir, lightCol (from previous), nNormal, diffLColor, diffTColor,diffONColor, nEyeDirection, lightDiffuseType);
vec4 computeDiffuse(vec3 lightDirection, vec4 lightColor, vec3 nVec, vec4 diffColor, vec3 eyeVec, float lightDiffuseType) {
  float dotN = max(0.0,dot(nVec, lightDirection));
  if(lightDiffuseType == 0.0) {//Lambert
    vec4 col = lightColor * diffColor;
    return  col * dotN;
  }else if(lightDiffuseType == 1.0){//Toon
    vec4 col = lightColor * diffColor;
    return max(sign(dotN- toonThr), 0.0) * col;
  }else if(lightDiffuseType == 2.0){//Oren Nayar
    vec4 col = lightColor * diffColor * dotN;
    float VdotN = max(0.0, dot(nVec, eyeVec));
    float theta_i = acos(dotN);
    float theta_r = acos(VdotN);
    float alpha = max(theta_i,theta_r);
    float beta = min(min(theta_i,theta_r),1.57);
    float sigmaTwo = orenRoughness * orenRoughness *2.46;
    float a = 1.0 -0.5*sigmaTwo/ (sigmaTwo + 0.33);
    float b = 0.45 * sigmaTwo/ (sigmaTwo + 0.09);
    vec3 v_i = normalize(lightDirection - nVec * dotN);
    vec3 v_r = normalize(eyeVec - nVec * VdotN);
    float g = max(0.0,dot(v_i,v_r));
    return  col*dotN*(a+b*g*sin(alpha)*tan(beta));

  } else{return vec4(0.0, 0.0, 0.0, 1.0);}//none
}

// Compute ambient light
vec4 computeAmbient(vec4 ambColor, vec3 normalVec, float type) {
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
  float dotN = max(0.0,dot(normalVec, lightDir));
  vec3 ref = -reflect(lightDir, normalVec);
  float dotR = max(dot(ref, eyeDir),0.0);
  vec3 halfVec = (normalize(lightDir + eyeDir));
  float hDotN = max(dot(normalVec, halfVec), 0.0);
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
vec4 computeMatAmbColor(float lType,vec4 textureColor){
  if(lType == 0.0) {//Lambert
    return ambientColor * (1.0-lambertTexture) + textureColor * lambertTexture;
  }else if(lType == 1.0){//Toon
    return ambientColor * (1.0 - toonTexture) + textureColor * toonTexture;
  }else if(lType == 2.0){//Oren Nayar
    return ambientColor*(1.0-orenTexture)+ textureColor*orenTexture;
  }else{
    return ambientColor*0.0;
  }
}
vec4 computeDiffusedColor(float lType,vec4 textureColor){
  if(lType == 0.0) {
    return lambertColor * (1.0 - lambertTexture) + textureColor * (lambertTexture);//lambert
  }else if(lType == 1.0){
    return toonColor * (1.0-toonTexture) + textureColor * toonTexture;//toon
  }else if(lType == 2.0){//Oren Nayar
    return orenColor *(1.0-orenTexture) + textureColor * orenTexture;//oren nayar
  }else{
    return textureColor*0.0;
  }
}
void main() {
 vec3 newSpotPosition = vec3(spotPosition.x,spotPosition.y+initialSpotY,spotPosition.z);
 vec3 eyePosition = vec3(0.0,0.0,0.0);
 vec3 nEyeDirection = normalize(eyePosition - fs_position);

 vec3 nNormal = normalize(fs_normal);
 vec4 textureColor = texture(u_texture, fs_uv);

 vec4 diffusedColor = computeDiffusedColor(lightDiffuseType,textureColor);
 vec4 ambientMatColor = computeMatAmbColor(lightDiffuseType, textureColor);

 vec3 lightDir = computeLightDir(newSpotPosition, pointPosition, dirDirection, lightType);
 vec4 lightCol = computeLightColor(directColor,spotColor, pointColor, pointDecay, pointPosition, spotDecay, newSpotPosition, spotConeIn, spotConeOut, lightDir, lightType);

 vec4 diffuse = computeDiffuse(lightDir, lightCol, nNormal, diffusedColor, nEyeDirection, lightDiffuseType);

 vec4 ambient = computeAmbient(ambientMatColor, nNormal, lightAmbientType);

 vec4 specular = computeSpecular(lightDir, lightCol, nNormal, nEyeDirection, lightSpecularType);

  outColor = clamp(diffuse + ambient + specular, 0.0, 1.0);
  outColor = vec4(outColor.rgb, 1.0);
}
