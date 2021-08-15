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
uniform vec3 spotPosition;
// Help variables
uniform int lightType;
uniform int lightAmbientType;
uniform int lightDiffuseType;
uniform int lightSpecularType;

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
//uniform vec4 orenColor;
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
uniform float spotTarget;
uniform vec3  spotDir;
uniform float spotConeIn;
uniform float spotConeOut;

// Hemispheric
uniform vec3 hemisphericDir;

// Lambert
uniform float lambertTexture;

// Toon
uniform float toonTexture;
uniform float toonThr;
//Oren Nayar
//uniform float orenTexture;
// Specular
uniform float phongShiny;
uniform float blinnShiny;
uniform float toonPThr;
uniform float toonBThr;

// Compute light Color
vec4 computeSpotLightColor(vec4 spotColor ,vec3 spotPosition,vec3 spotDir,float spotDecay,float spotConeIn, float spotConeOut ){
  vec3 spotLightDir = normalize(spotPosition - fs_position);
  float cosAngle = dot(spotLightDir, spotDir);
  return spotColor * pow(spotTarget/length(spotPosition - fs_position), spotDecay) * clamp(((cosAngle - spotConeOut) / (spotConeIn - spotConeOut)), 0.0, 1.0);
}
//Compute Diffuse lighting
vec4 computeLambertDiffuse(vec3 lightDir, vec4 lightCol, vec3 normalVec, vec4 diffColor){
    float LdotN = max(0.0 , dot(normalVec, lightDir));
    vec4 LDcol = lightCol * diffColor;
    return LDcol* LdotN;
}
vec4 computeToonDiffuse( vec3 lightDir, vec4 lightCol , vec3 normalVec, vec4 diffColor){
    float LdotN = max(0.0, dot(normalVec, lightDir));
    vec4 LDcol = lightCol*diffColor;
    return max( sign(LdotN - toonThr), 0.0)*LDcol;
}
/*vec4 computeOrenNayarDiffuse( vec3 lightDir, vec4 lightCol , vec3 normalVec, vec4 diffColor,vec3 eyeDirVec){
  float LdotN = max(0.0, dot(normalVec, lightDir));
  vec4 LDcol = lightCol * diffColor;
  float VdotN = max(0.0, dot(normalVec, eyeDirVec));//this needs to be modified
  float theta_i = acos(LdotN);
  float theta_r = acos(VdotN);
  float alpha = max(theta_i,theta_r);
  float beta = min(min(theta_i,theta_r),1.57);
  float sigmaTwo = toonThr * toonThr *2.46;
  float a = 1.0 -0.5*sigmaTwo/ (sigmaTwo + 0.33);
  float b = 0.45 * sigmaTwo/ (sigmaTwo + 0.09);
  vec3 v_i = normalize(lightDir - normalVec * LdotN);
  vec3 v_r = normalize(eyeDirVec - normalVec * VdotN);
  float g = max(0.0,dot(v_i,v_r));
  return  LDcol*LdotN*(a+b*g*sin(alpha)*tan(beta));
}*/
vec4 computePhongSpecular( vec3 lightDir, vec4 lightCol, vec3 normalVec, vec3 eyeDirVec){
  float LdotN = max(0.0, dot(normalVec, lightDir));//
	vec3 reflection = -reflect(lightDir, normalVec);//
	float LdotR = max(dot(reflection, eyeDirVec), 0.0);//
	vec4 LScol = lightCol * phongColor * max(sign(LdotN),0.0);
	// --> Phong
	return LScol * pow(LdotR, phongShiny);
  //return lightCol * phongColor * max(sign(dotN), 0.0) * pow(dotR, phongShiny);
}
vec4 computeBlinnSpecular( vec3 lightDir, vec4 lightCol , vec3 normalVec, vec3 eyeDirVec){
  float LdotN = max(0.0, dot(normalVec, lightDir));//
  vec3 reflection = -reflect(lightDir, normalVec);//
  float LdotR = max(dot(reflection, eyeDirVec), 0.0);//
  vec3 halfVec = normalize(lightDir+eyeDirVec);
  float HdotN = max(dot(normalVec,halfVec),0.0);
  vec4 LScol = lightCol * blinnColor * max(sign(LdotN),0.0);
  // --> Blinn
  return LScol * pow(HdotN, blinnShiny);
}
vec4 computeToonPhongSpecular( vec3 lightDir, vec4 lightCol , vec3 normalVec, vec3 eyeDirVec){
  float LdotN = max(0.0, dot(normalVec, lightDir));//
  vec3 reflection = -reflect(lightDir, normalVec);//
  float LdotR = max(dot(reflection, eyeDirVec), 0.0);//
  vec4 LScol = lightCol * toonPColor * max(sign(LdotN),0.0);
  // --> Toon Phong
  return max(sign(LdotR- toonPThr),0.0)*LScol;
}
vec4 computeToonBlinnSpecular( vec3 lightDir, vec4 lightCol , vec3 normalVec, vec3 eyeDirVec){
  float LdotN = max(0.0, dot(normalVec, lightDir));//
  vec3 reflection = -reflect(lightDir, normalVec);//
  float LdotR = max(dot(reflection, eyeDirVec), 0.0);//
  vec3 halfVec = normalize(lightDir+eyeDirVec);
  float HdotN = max(dot(normalVec,halfVec),0.0);
  vec4 LScol = lightCol * toonBColor * max(sign(LdotN),0.0);
  // --> Blinn
  return max(sign(HdotN- toonBThr),0.0)*LScol;
}
/*vec4 computeCookTorranceSpecular( vec3 lightDir, vec4 lightCol , vec3 normalVec, vec3 eyeDirVec){
  float LdotN = max(0.0, dot(normalVec, lightDir));//
  vec3 reflection = -reflect(lightDir, normalVec);//
  float LdotR = max(dot(reflection, eyeDirVec), 0.0);//
  vec3 halfVec = normalize(lightDir+eyeDirVec);
  float HdotN = max(dot(normalVec,halfVec),0.0);
  vec4 LScol = lightCol * blinnColor * max(sign(LdotN),0.0);
  // --> CookTorrance
  LdotN = max(0.00001, LdotN);
float VdotN = max(0.00001, dot(normalVec, eyeDirVec));
HdotN = max(0.00001, HdotN);
float HdotV = max(0.00001, dot(halfVec, eyeDirVec));
float Gm = min(1.0, 2.0 * HdotN * min(VdotN, LdotN) / HdotV);
float F = SToonTh + (1.0 - SToonTh) * pow(1.0 - HdotV, 5.0);
float HtoN2 = HdotN * HdotN;
float M = (200.0 - SpecShine) / 200.0;
float M2 = M * M;
float Ds = exp(- (1.0-HtoN2) / (HtoN2 * M2)) / (3.14159 * M2 * HtoN2 * HtoN2);
float GGXk = (M+1.0)*(M+1.0)/8.0;
float GGGX = VdotN * LdotN / (((1.0-GGXk) * VdotN + GGXk)*((1.0-GGXk) * LdotN + GGXk));
float DGGXn = M2 * M2;
float DGGXd = HtoN2*(M2 * M2-1.0)+1.0;
DGGXd = 3.14 * DGGXd * DGGXd;
float DGGX = DGGXn / DGGXd;

float DG = specularType.z * GGGX * DGGX + (1.0 - specularType.z) * Gm * Ds;

return LScol * F * DG / (4.0 * VdotN);
}*/
/*vec4 computeWardSpecular( vec3 lightDir, vec4 lightCol , vec3 normalVec, vec3 eyeDirVec, vec3 t, vec3 b){
  float LdotN = max(0.0, dot(normalVec, lightDir));//
  vec3 reflection = -reflect(lightDir, normalVec);//
  float LdotR = max(dot(reflection, eyeDirVec), 0.0);//
  vec3 halfVec = normalize(lightDir+eyeDirVec);
  float HdotN = max(dot(normalVec,halfVec),0.0);
  vec4 LScol = lightCol * blinnColor * max(sign(LdotN),0.0);
  // --> CookTorrance
  LdotN = max(0.00001, LdotN);
float VdotN = max(0.00001, dot(normalVec, eyeDirVec));
HdotN = max(0.00001, HdotN);
float M = (200.0 - SpecShine) / 200.0;//
float M2 = M * M;//
float DG = specularType.z * GGGX * DGGX + (1.0 - specularType.z) * Gm * Ds;
float alphaX = M2;
float alphaY = M2 * (1.0 - 0.999*SToonTh);
float sang = sin(3.14 * SspecKwAng);
float cang = cos(3.14 * SspecKwAng);
float wsX = pow(HdotT * cang - HdotB * sang, 2.0);
float wsY = pow(HdotB * cang + HdotT * sang, 2.0);

return LScol / (12.566*sqrt(VdotN / LdotN*alphaX*alphaY)) * exp(-(wsX / alphaX + wsY / alphaY) / pow(HdotN,2.0)) ;
}*/
// Compute light direction
vec3 computeLightDir(vec3 sPos, vec3 pPos, vec3 Dir, int type) {
  if (type == 0) {
    // Direct
    return Dir;
  } else if (type == 1) {
    // Point
    return normalize(pPos - fs_position);
  } else if (type == 2) {
    // Spot
    return normalize(sPos - fs_position);
  } else {
    return Dir;
  }
}
// Compute light color
vec4 computeLightColor(vec4 dColor, vec4 sColor, vec4 pColor, float pDecay, vec3 pPos, float sDecay, vec3 spotPosition, float sConeIn, float sConeOut, vec3 dir, int type) {
  if (type == 0) {
    // Direct
    return dColor;
  } else if (type == 1) {
    // Point
    return pColor * pow(pointTarget / length(pPos - fs_position), pDecay);
  } else if (type == 2) {
    // Spot
    vec3 spotLightDir = normalize(spotPosition - fs_position);
    float cosAngle = dot(spotLightDir, spotDir);
    return sColor * pow(spotTarget/length(spotPosition - fs_position), sDecay) * clamp(((cosAngle - sConeOut) / (sConeIn - sConeOut)), 0.0, 1.0);
    } else {
    return dColor * vec4(0.0, 0.0, 0.0, 1.0);
  }
}
// Compute ambient light
vec4 computeAmbientLight(vec4 ambColor, vec3 normalVec, float type, vec3 lightDir) {
    return ambColor * ambientColor;
  }
vec4 computeHemisphericLight(vec4 ambColor, vec3 normalVec,vec3 lightDir) {
    // Hemispheric
    float blend = (dot(normalVec, hemisphericDir) +1.0) / 2.0;
    return (ambientUpperColor * blend + ambientLowerColor * (1.0 - blend)) * ambColor;
}
vec4 computeNoAmbient(){
    return vec4(0.0, 0.0, 0.0, 1.0);
}
// Compute diffuse light
vec4 computeDiffuse(vec3 lightDirection, vec4 lightColor, vec3 nVec, vec4 diffLColor, vec4 diffTColor, vec3 eyeVec, int type) {
    float dotN = clamp(dot(nVec, lightDirection), 0.0, 1.0);
  if (type == 0) {
    vec4 col = lightColor * diffLColor;
    // Lambert
    return dotN * col;
  } else if (type == 1) {
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
vec4 computeAmbient(vec4 ambColor, vec3 normalVec, int type, vec3 lightDir) {
  if (type == 0) {
    // Ambient
    return ambColor * ambientColor;
  } else if (type == 1) {
    // Hemispheric
    float blend = (dot(normalVec, hemisphericDir) +1.0) / 2.0;
    return (ambientUpperColor * blend + ambientLowerColor * (1.0 - blend)) * ambColor;
  } else {
    // None
    return vec4(0.0, 0.0, 0.0, 1.0);
  }
}
// Compute specular light
vec4 computeSpecular(vec3 lightDir, vec4 lightCol, vec3 normalVec, vec3 eyeDir, int type) {
  float dotN = clamp(dot(normalVec, lightDir), 0.0, 1.1);
  vec3 ref = -reflect(lightDir, normalVec);
  float dotR = clamp(dot(ref, eyeDir), 0.0, 1.0);
  vec3 halfVec = (normalize(lightDir + eyeDir));
  float hDotN = clamp(dot(normalVec, halfVec), 0.0, 1.0);
  if (type == 0) {
    // Phong
    return lightCol * phongColor * max(sign(dotN), 0.0) * pow(dotR, phongShiny);
  } else if (type == 1) {
    // Blinn
    return lightCol * blinnColor * max(sign(dotN), 0.0) * pow(hDotN, blinnShiny);
  } else if (type == 2) {
    // Toon Phong
    return max(sign(dotR - toonPThr), 0.0) * lightCol * toonPColor * max(sign(dotN), 0.0);
  } else if (type == 3) {
    // Toon Blinn
    return max(sign(hDotN - toonBThr), 0.0) * lightCol * toonBColor * max(sign(dotN), 0.0);
  }
  else {
    return vec4(0.0, 0.0, 0.0, 0.0);
  }
}

void main() {

 // Initial Spot position for boat 1
 vec3 spotPosition = vec3(0.0,10.0,0.0);
 vec3 eyePosition = vec3(0.0,0.0,0.0);
 vec3 finalSpotPosition = spotPosition + vec3(0.0, spotPosY*1.0, 0.0);

 vec3 nEyeDirection = normalize(eyePosition - fs_position);
 vec3 nNormal = normalize(fs_normal);
 vec4 textureColor = texture(u_texture, fs_uv);

 vec4 diffLColor = lambertColor * (1.0 - lambertTexture) + textureColor * (lambertTexture);
 vec4 diffTColor = toonColor * (toonTexture) + textureColor * (1.0 - toonTexture);
 //vec4 diffONColor = orenColor * (orenTexture) + textureColor * (1.0 - orenTexture);
 vec4 ambientMatColor = ambientColor * 0.2 + textureColor * 0.8;

vec3 lightDir = computeLightDir(finalSpotPosition, pointPos, dirDirection, lightType);
vec4 lightColor = computeLightColor(directColor,spotColor, pointColor, pointDecay, pointPos, spotDecay, finalSpotPosition, spotConeIn/100.0, spotConeOut, lightDir, lightType);
/*switch(lightType){
  case 0:
    lightDir = dirDirection;
    lightColor = directColor;
    break;
  case 1:
    lightDir = normalize(pointPos-fs_position);
    lightColor = pointColor*pow(pointTarget/length(pointPos-fs_position),pointDecay);
    break;
  case 2:
    lightDir = normalize(finalSpotPosition-fs_position);
    lightColor = computeSpotLightColor(spotColor,finalSpotPosition,spotDir,spotDecay,spotConeIn,spotConeOut);
    break;
  default:
    lightDir = dirDirection;
    lightColor = directColor;
}*/
vec4 diffuse=computeDiffuse(lightDir, lightColor, nNormal, diffLColor, diffTColor, nEyeDirection, lightDiffuseType);
/*switch(lightDiffuseType){
  case 0://lambert
        diffuse = computeLambertDiffuse(lightDir, lightColor, nNormal, diffLColor);
        break;
  case 1://Toon
        diffuse = computeToonDiffuse(lightDir, lightColor, nNormal,diffTColor);
        break;
  case 2://Oren Nayar
        diffuse = computeOrenNayarDiffuse(lightDir, lightColor,nNormal,diffONColor,nEyeDirection);
        break;
}*/
vec4 ambient =computeAmbient(ambientMatColor, nNormal, lightAmbientType, lightDir);
/*switch(lightAmbientType){
  case 0: ambient = ambientMatColor * ambientColor;
          break;
  case 1: ambient = computeHemisphericLight(ambientMatColor,nNormal,hemisphericDir);
          break;
  default:ambient = vec4(0.0,0.0,0.0,1.0);

}*/
vec4 specular = computeSpecular(lightDir, lightColor, nNormal, nEyeDirection, lightSpecularType);
 /*switch(lightSpecularType){
   case 0: specular = computePhongSpecular(lightDir, lightColor, nNormal, nEyeDirection);
           break;
   case 1: specular = computeBlinnSpecular(lightDir, lightColor,nNormal, nEyeDirection);
           break;
   case 2: specular = computeToonPhongSpecular(lightDir, lightColor, nNormal, nEyeDirection);
           break;
   case 3: specular = computeToonBlinnSpecular(lightDir, lightColor, nNormal, nEyeDirection);
           break;
   default: specular = vec4(0.0,0.0,0.0,1.0);
 }*/
  outColor = clamp(diffuse + ambient + specular, 0.0, 1.0);
  outColor = vec4(outColor.rgb, 1.0);
}
