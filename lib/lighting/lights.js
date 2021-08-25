class lightLocation {
    constructor() {
      //boat Illumination
        this.lightType = null;
        //direct Light
        this.directColor = null;
        this.dirDirection = null;//directLighting direction
        //point light
        this.pointColor = null;
        this.pointPosition = null;
        this.pointTarget = null;
        this.pointDecay = null;
        //spot light
        this.spotColor = null;
        this.spotPosition = null;
        this.initialSpotY = null;
        this.spotDecay = null;
        this.spotTarget = null;
        this.spotDir = null;
        this.spotConeIn = null;
        this.spotConeOut = null;
        //diffuse
        this.lightDiffuseType = null;
        //lambert
        this.lambertColor = null;
        this.lambertTexture = null;
        //toon
        this.toonColor = null;
        this.toonTexture = null;
        this.toonThr = null;
        //oren nayar
        this.orenColor = null;
        this.orenTexture = null;
        this.orenRoughness = null;
        //Specular
        this.lightSpecularType =null;
        //phong
        this.phongColor = null;
        this.phongShiny = null;
        //blinn
        this.blinnColor = null;
        this.blinnShiny = null;
        //toon phong
        this.toonPColor = null;
        this.toonPThr = null;
        //toon blinn
        this.toonBColor = null;
        this.toonBThr = null;
        //ambient
        this.lightAmbientType = null;
        this.ambientColor = null;
        //hemispheric
        this.hemisphericDir = null;
        this.ambientLowerColor = null;
        this.ambientUpperColor = null;

    }
}

var lights = {
    lightLocations: function (obj) {
      var progInfo = obj.drawInfo.programInfo;
      var lightLoc = obj.drawInfo.lightLocation;
      lightLoc.lightType = gl.getUniformLocation(progInfo, 'lightType');
      lightLoc.lightAmbientType = gl.getUniformLocation(progInfo, 'lightAmbientType');
      lightLoc.lightDiffuseType = gl.getUniformLocation(progInfo, 'lightDiffuseType');
      lightLoc.lightSpecularType = gl.getUniformLocation(progInfo, 'lightSpecularType');

      lightLoc.directColor = gl.getUniformLocation(progInfo,'directColor');
      lightLoc.pointColor = gl.getUniformLocation(progInfo,'pointColor');
      lightLoc.spotColor = gl.getUniformLocation(progInfo,'spotColor');

      lightLoc.ambientColor = gl.getUniformLocation(progInfo, 'ambientColor');
      lightLoc.ambientLowerColor = gl.getUniformLocation(progInfo, 'ambientLowerColor');
      lightLoc.ambientUpperColor = gl.getUniformLocation(progInfo, 'ambientUpperColor');
      lightLoc.lambertColor = gl.getUniformLocation(progInfo, 'lambertColor');
      lightLoc.toonColor = gl.getUniformLocation(progInfo, 'toonColor');
      lightLoc.orenColor = gl.getUniformLocation(progInfo, 'orenColor');
      lightLoc.phongColor = gl.getUniformLocation(progInfo, 'phongColor');
      lightLoc.blinnColor = gl.getUniformLocation(progInfo, 'blinnColor');
      lightLoc.toonPColor = gl.getUniformLocation(progInfo, 'toonPColor');
      lightLoc.toonBColor = gl.getUniformLocation(progInfo, 'toonBColor');

      lightLoc.dirDirection = gl.getUniformLocation(progInfo, 'dirDirection');
      lightLoc.pointPosition = gl.getUniformLocation(progInfo, 'pointPosition');
      lightLoc.pointDecay = gl.getUniformLocation(progInfo, 'pointDecay');
      lightLoc.pointTarget = gl.getUniformLocation(progInfo, 'pointTarget');
      lightLoc.spotPosition = gl.getUniformLocation(progInfo, 'spotPosition');
      lightLoc.initialSpotY = gl.getUniformLocation(progInfo, 'initialSpotY');
      lightLoc.spotDecay = gl.getUniformLocation(progInfo, 'spotDecay');
      lightLoc.spotTarget = gl.getUniformLocation(progInfo, 'spotTarget');
      lightLoc.spotDir = gl.getUniformLocation(progInfo, 'spotDir');
      lightLoc.spotConeIn = gl.getUniformLocation(progInfo, 'spotConeIn');
      lightLoc.spotConeOut = gl.getUniformLocation(progInfo, 'spotConeOut');
      lightLoc.hemisphericDir = gl.getUniformLocation(progInfo, 'hemisphericDir');
      lightLoc.lambertTexture = gl.getUniformLocation(progInfo, 'lambertTexture');
      lightLoc.toonTexture = gl.getUniformLocation(progInfo, 'toonTexture');
      lightLoc.orenTexture = gl.getUniformLocation(progInfo, 'orenTexture');
      lightLoc.toonThr = gl.getUniformLocation(progInfo, 'toonThr');
      lightLoc.orenRoughness = gl.getUniformLocation(progInfo, 'orenRoughness');
      lightLoc.phongShiny = gl.getUniformLocation(progInfo, 'phongShiny');
      lightLoc.blinnShiny = gl.getUniformLocation(progInfo, 'blinnShiny');
      lightLoc.toonPThr = gl.getUniformLocation(progInfo, 'toonPThr');
      lightLoc.toonBThr = gl.getUniformLocation(progInfo, 'toonBThr');
    },

    setLightValues: function (obj) {
        gl.useProgram(obj.drawInfo.programInfo);
        var bID = obj.id;
        // Helper Variables
        var lightLoc = obj.drawInfo.lightLocation;
        //console.log(lightsInfo[bID]);
        gl.uniform1f(lightLoc.lightType, typeToFloat(lightsInfo[bID].lightType));
        gl.uniform1f(lightLoc.lightAmbientType, typeToFloat(lightsInfo[bID].lightAmbientType));
        gl.uniform1f(lightLoc.lightDiffuseType, typeToFloat(lightsInfo[bID].lightDiffuseType));
        gl.uniform1f(lightLoc.lightSpecularType, typeToFloat(lightsInfo[bID].lightSpecularType));
        // Colors
        gl.uniform4fv(lightLoc.directColor, extendColor(lightsInfo[bID].directColor));
        gl.uniform4fv(lightLoc.pointColor, extendColor(lightsInfo[bID].pointColor));
        gl.uniform4fv(lightLoc.spotColor, extendColor(lightsInfo[bID].spotColor));
        gl.uniform4fv(lightLoc.ambientColor, extendColor(lightsInfo[bID].ambientColor));
        gl.uniform4fv(lightLoc.ambientLowerColor, extendColor(lightsInfo[bID].ambientLowerColor));
        gl.uniform4fv(lightLoc.ambientUpperColor, extendColor(lightsInfo[bID].ambientUpperColor));
        gl.uniform4fv(lightLoc.lambertColor, extendColor(lightsInfo[bID].lambertColor));
        gl.uniform4fv(lightLoc.toonColor, extendColor(lightsInfo[bID].toonColor));
        gl.uniform4fv(lightLoc.orenColor, extendColor(lightsInfo[bID].orenColor));
        gl.uniform4fv(lightLoc.phongColor, extendColor(lightsInfo[bID].phongColor));
        gl.uniform4fv(lightLoc.blinnColor, extendColor(lightsInfo[bID].blinnColor));
        gl.uniform4fv(lightLoc.toonPColor, extendColor(lightsInfo[bID].toonPColor));
        gl.uniform4fv(lightLoc.toonBColor, extendColor(lightsInfo[bID].toonBColor));

        // Other variables
        //Direct Light variables
        var dirLightTransformed = computeOurLightTransformed( utils.degToRad(lightsInfo[bID].directTheta), utils.degToRad(lightsInfo[bID].directPhi));
        gl.uniform3fv(obj.drawInfo.lightLocation.dirDirection, dirLightTransformed);

        //Point Light
        var lightPosTransformed = utils.multiplyMatrixVector(viewMatrix,[lightsInfo[bID].pointPosX, lightsInfo[bID].pointPosY, lightsInfo[bID].pointPosZ, 1.0]);
        gl.uniform3fv(obj.drawInfo.lightLocation.pointPosition,lightPosTransformed.slice(0,3));
        gl.uniform1f(obj.drawInfo.lightLocation.pointDecay,lightsInfo[bID].pointDecay);
        gl.uniform1f(obj.drawInfo.lightLocation.pointTarget,lightsInfo[bID].pointTarget/*/10.0*/);
        //Spot variables
        var spot_position =[lightsInfo[bID].spotPosX, lightsInfo[bID].spotPosY, lightsInfo[bID].spotPosZ, 1.0];
        lightPosTransformed = utils.multiplyMatrixVector(viewMatrix,spot_position);
        gl.uniform3fv(lightLoc.spotPosition, lightPosTransformed.slice(0,3));
        gl.uniform1f(lightLoc.initialSpotY, lightsInfo[bID].initialSpotY);
        gl.uniform1f(lightLoc.spotDecay, lightsInfo[bID].spotDecay);
        gl.uniform1f(lightLoc.spotTarget, lightsInfo[bID].spotTarget/*/10.0*/);
        //Spot light direction
        dirLightTransformed = computeOurLightTransformed(utils.degToRad(lightsInfo[bID].spotTheta),utils.degToRad(lightsInfo[bID].spotPhi));
        gl.uniform3fv(lightLoc.spotDir, dirLightTransformed);

        gl.uniform1f(lightLoc.spotConeIn, lightsInfo[bID].spotConeIn/100.0);
        gl.uniform1f(lightLoc.spotConeOut, lightsInfo[bID].spotConeOut);
        //Hemispheric variables
        dirLightTransformed = computeOurLightTransformed(utils.degToRad(lightsInfo[bID].hemisphericTheta), utils.degToRad(lightsInfo[bID].hemisphericPhi));
        gl.uniform3fv(lightLoc.hemisphericDir, dirLightTransformed);

        gl.uniform1f(lightLoc.lambertTexture, lightsInfo[bID].lambertTexture / 100);
        gl.uniform1f(lightLoc.toonTexture, lightsInfo[bID].toonTexture / 100);
        gl.uniform1f(lightLoc.orenTexture, lightsInfo[bID].orenTexture / 100);
        gl.uniform1f(lightLoc.toonThr, lightsInfo[bID].toonThr/100);
        gl.uniform1f(lightLoc.orenRoughness, lightsInfo[bID].orenRoughness/100);
        gl.uniform1f(lightLoc.phongShiny, lightsInfo[bID].phongShiny);
        gl.uniform1f(lightLoc.blinnShiny, lightsInfo[bID].blinnShiny);
        gl.uniform1f(lightLoc.toonPThr, lightsInfo[bID].toonPThr/100);
        gl.uniform1f(lightLoc.toonBThr, lightsInfo[bID].toonBThr/100);

    },

}
function typeToFloat(type) {
    if (type == "direct" || type == "ambient" || type == "lambert" || type == "phong") {
        return 0.0;
    } else if (type == "point" || type == "hemispheric" || type == "toon" || type == "blinn") {
        return 1.0;
    } else if (type == "spot" || type == "oren" || type == "toonPhong") {
        return 2.0;
    } else if (type == "toonBlinn") {
        return 3.0;
    } else {
        // Default case = none
        return 9;
    }
  }
  function extendColor(color) {
      let out = new Float32Array([color[0], color[1], color[2], 1.0]);
      return out;
  }
  //includes transformations, used for hemispheric
  function computeOurLightTransformed(theta, phi){
      var dir = [Math.sin(theta) * Math.sin(phi),
                 Math.cos(theta),
                 Math.sin(theta) * Math.cos(phi)];
      return utils.multiplyMatrix3Vector3(utils.sub3x3from4x4(viewMatrix),dir);
  }
