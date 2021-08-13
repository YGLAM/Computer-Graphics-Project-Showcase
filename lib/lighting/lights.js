var dirLightAlpha = -utils.degToRad(60);
var dirLightBeta = -utils.degToRad(120);

var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
Math.sin(dirLightAlpha),
Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
];
var directionalLightColor = [0.85, 0.85, 0.85];
var materialColor = [0.5, 0.5, 0.5];

var lightPos = [20.0, 3.0, 0.0, 1.0];
var lightTarget = 10;
var lightDecay = 0;


class lightLocation {
    constructor() {
      //boat Illumination
        this.lightType = null;
        this.lightAmbient = null;
        this.lightDiffuse = null;
        this.lightSpecular =null;
        this.directColor = null;
        this.pointColor = null;
        this.spotColor = null;
        this.ambientColor = null;
        this.ambientLowerColor = null;
        this.ambientUpperColor = null;
        this.lambertColor = null;
        this.toonColor = null;
        this.phongColor = null;
        this.blinnColor = null;
        this.toonPColor = null;
        this.toonBColor = null;
        //Directions
        this.spotPosY = null;
        this.spotDecay = null;
        this.spotTarget = null;
        this.spotDir = null;
        this.spotConeIn = null;
        this.spotConeOut = null;
        this.hemisphericDir = null;
        this.lambertTexture = null;
        this.toonTexture = null;
        this.toonThr = null;
        this.phongShiny = null;
        this.blinnShiny = null;
        this.toonPThr = null;
        this.toonBThr = null;
        //Shared with world illumination
        this.dirDirection = null;//directLighting direction
        this.pointPos = null;
        this.pointTarget = null;
        this.pointDecay = null;
        //World Illumination
        //this.mDiffColor = null; instead of this use the Lambert Color field
        //this.dirColor = null; instead use directColor
        //this.pointLightColor = null; instead use pointColor
        //this.spotLightColor = null; instead use spotColor
    }
}

var lights = {
    // Initialise the program's lighthing parameters
    // var materialDiffColorHandle = gl.getUniformLocation(program, 'mDiffColor');
    // var lightColorHandle = gl.getUniformLocation(program, 'lightColor');

    // var lightDirectionHandle = gl.getUniformLocation(program, 'lightDirection');

    // var lightPosHandle = gl.getUniformLocation(program, "lightPos");
    // var lightTargetHandle = gl.getUniformLocation(program, "lightTarget");
    // var lightDecayHandle = gl.getUniformLocation(program, "lightDecay");
    lightLocations: function (obj) {
      var progInfo = obj.drawInfo.programInfo;
      var lightLoc = obj.drawInfo.lightLocation;
      lightLoc.lightType = gl.getUniformLocation(progInfo, 'lightType');
      lightLoc.lightAmbient = gl.getUniformLocation(progInfo, 'lightAmbient');
      lightLoc.lightDiffuse = gl.getUniformLocation(progInfo, 'lightDiffuse');
      lightLoc.lightSpecular = gl.getUniformLocation(progInfo, 'lightSpecular');

      /*lightLoc.mDiffColor = gl.getUniformLocation(progInfo, 'mDiffColor');
      lightLoc.dirColor = gl.getUniformLocation(progInfo, 'dirColor');
      lightLoc.pointLightColor = gl.getUniformLocation(progInfo, 'pointColor');
      lightLoc.spotLightColor = gl.getUniformLocation(progInfo, 'spotColor');*/
      lightLoc.directColor = gl.getUniformLocation(progInfo,'directColor');
      lightLoc.pointColor = gl.getUniformLocation(progInfo,'pointColor');
      lightLoc.spotColor = gl.getUniformLocation(progInfo,'spotColor');

      lightLoc.ambientColor = gl.getUniformLocation(progInfo, 'ambientColor');
      lightLoc.ambientLowerColor = gl.getUniformLocation(progInfo, 'ambientLowerColor');
      lightLoc.ambientUpperColor = gl.getUniformLocation(progInfo, 'ambientUpperColor');
      lightLoc.lambertColor = gl.getUniformLocation(progInfo, 'lambertColor');
      lightLoc.toonColor = gl.getUniformLocation(progInfo, 'toonColor');
      lightLoc.phongColor = gl.getUniformLocation(progInfo, 'phongColor');
      lightLoc.blinnColor = gl.getUniformLocation(progInfo, 'blinnColor');
      lightLoc.toonPColor = gl.getUniformLocation(progInfo, 'toonPColor');
      lightLoc.toonBColor = gl.getUniformLocation(progInfo, 'toonBColor');

      lightLoc.dirDirection = gl.getUniformLocation(progInfo, 'dirDirection');
      lightLoc.pointPos = gl.getUniformLocation(progInfo, 'pointPos');
      lightLoc.pointDecay = gl.getUniformLocation(progInfo, 'pointDecay');
      lightLoc.pointTarget = gl.getUniformLocation(progInfo, 'pointTarget');
      lightLoc.spotPosY = gl.getUniformLocation(progInfo, 'spotPosY');
      lightLoc.spotDecay = gl.getUniformLocation(progInfo, 'spotDecay');
      lightLoc.spotTarget = gl.getUniformLocation(progInfo, 'spotTarget');
      lightLoc.spotDir = gl.getUniformLocation(progInfo, 'spotDir');
      lightLoc.spotConeIn = gl.getUniformLocation(progInfo, 'spotConeIn');
      lightLoc.spotConeOut = gl.getUniformLocation(progInfo, 'spotConeOut');
      lightLoc.hemisphericDir = gl.getUniformLocation(progInfo, 'hemisphericDir');
      lightLoc.lambertTexture = gl.getUniformLocation(progInfo, 'lambertTexture');
      lightLoc.toonTexture = gl.getUniformLocation(progInfo, 'toonTexture');
      lightLoc.toonThr = gl.getUniformLocation(progInfo, 'toonThr');
      lightLoc.phongShiny = gl.getUniformLocation(progInfo, 'phongShiny');
      lightLoc.blinnShiny = gl.getUniformLocation(progInfo, 'blinnShiny');
      lightLoc.toonPThr = gl.getUniformLocation(progInfo, 'toonPThr');
      lightLoc.toonBThr = gl.getUniformLocation(progInfo, 'toonBThr');
    },

    setLightValues: function (obj) {
        gl.useProgram(obj.drawInfo.programInfo);
        console.log(lightsInfo);
        var bID = obj.id;
        console.log("boat ID: "+ bID);
        console.log(lightsInfo[bID]);
        // Helper Variables
        var lightLoc = obj.drawInfo.lightLocation;
        gl.uniform1f(lightLoc.lightType, typeToFloat(lightsInfo[bID].lightType));
        gl.uniform1f(lightLoc.lightAmbient, typeToFloat(lightsInfo[bID].lightAmbient));
        gl.uniform1f(lightLoc.lightDiffuse, typeToFloat(lightsInfo[bID].lightDiffuse));
        gl.uniform1f(lightLoc.lightSpecular, typeToFloat(lightsInfo[bID].lightSpecular));

        //gl.uniform3fv(obj.drawInfo.lightLocation.mDiffColor, lightsInfo[bID].dirColor/*materialColor*/);
        // Colors
        gl.uniform3fv(obj.drawInfo.lightLocation.directColor, lightsInfo[bID].directColor/*directionalLightColor*/);
        gl.uniform4fv(lightLoc.pointColor, extendColor(lightsInfo[bID].pointColor));
        gl.uniform4fv(lightLoc.spotColor, extendColor(lightsInfo[bID].spotColor));
        gl.uniform4fv(lightLoc.ambientColor, extendColor(lightsInfo[bID].ambientColor));
        gl.uniform4fv(lightLoc.ambientLowerColor, extendColor(lightsInfo[bID].ambientLowerColor));
        gl.uniform4fv(lightLoc.ambientUpperColor, extendColor(lightsInfo[bID].ambientUpperColor));
        gl.uniform4fv(lightLoc.lambertColor, extendColor(lightsInfo[bID].lambertColor));
        gl.uniform4fv(lightLoc.toonColor, extendColor(lightsInfo[bID].toonColor));
        gl.uniform4fv(lightLoc.phongColor, extendColor(lightsInfo[bID].phongColor));
        gl.uniform4fv(lightLoc.blinnColor, extendColor(lightsInfo[bID].blinnColor));
        gl.uniform4fv(lightLoc.toonPColor, extendColor(lightsInfo[bID].toonPColor));
        gl.uniform4fv(lightLoc.toonBColor, extendColor(lightsInfo[bID].toonBColor));

        // Other variables
        //Direct Light variables
        //Direct Light direction
        let dir = [Math.sin(utils.degToRad(lightsInfo[bID].directTheta)) * Math.sin(utils.degToRad(lightsInfo[bID].directPhi)),
        Math.cos(utils.degToRad(lightsInfo[bID].directTheta)),
        Math.sin(utils.degToRad(lightsInfo[bID].directTheta)) * Math.cos(utils.degToRad(lightsInfo[bID].directPhi))];

        var dirLightTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4(viewMatrix), directionalLight);
        gl.uniform3fv(obj.drawInfo.lightLocation.dirDirection, dirLightTransformed);

        var lightPosTransformed = utils.multiplyMatrixVector(viewMatrix, lightPos);
        gl.uniform3fv(obj.drawInfo.lightLocation.pointPos,/* lightPosTransformed.slice(0, 3)*/[lightsInfo[bID].pointPosX * 100, lightsInfo[bID].pointPosY * 100, lightsInfo[bID].pointPosZ * 100]);
        gl.uniform1f(obj.drawInfo.lightLocation.pointDecay,/*lightDecay*/lightsInfo[bID].pointDecay);
        gl.uniform1f(obj.drawInfo.lightLocation.pointTarget,/* lightTarget*/lightsInfo[bID].pointTarget * 400);
        //Spot variables
        gl.uniform1f(lightLoc.spotPosY, lightsInfo[bID].spotPosY);
        gl.uniform1f(lightLoc.spotDecay, lightsInfo[bID].spotDecay);
        gl.uniform1f(lightLoc.spotTarget, lightsInfo[bID].spotTarget);
        //Spot light direction
        dir = [Math.sin(utils.degToRad(lightsInfo[bID].spotTheta)) * Math.sin(utils.degToRad(lightsInfo[bID].spotPhi)),
               Math.cos(utils.degToRad(lightsInfo[bID].spotTheta)),
               Math.sin(utils.degToRad(lightsInfo[bID].spotTheta)) * Math.cos(utils.degToRad(lightsInfo[bID].spotPhi))];
        gl.uniform3fv(lightLoc.spotDir, dir);

        gl.uniform1f(lightLoc.spotConeIn, lightsInfo[bID].spotConeIn);
        gl.uniform1f(lightLoc.spotConeOut, lightsInfo[bID].spotConeOut);
        //Hemispheric variables
        dir = [Math.sin(utils.degToRad(lightsInfo[bID].hemisphericTheta))* Math.sin(utils.degToRad(lightsInfo[bID].hemisphericPhi)),
               Math.cos(utils.degToRad(lightsInfo[bID].hemisphericTheta)),
               Math.sin(utils.degToRad(lightsInfo[bID].hemisphericTheta))* Math.cos(utils.degToRad(lightsInfo[bID].hemisphericPhi))];
        gl.uniform3fv(lightLoc.hemisphericDir, dir);

        gl.uniform1f(lightLoc.lambertTexture, lightsInfo[bID].lambertTexture / 100);
        gl.uniform1f(lightLoc.toonTexture, lightsInfo[bID].toonTexture / 100);
        gl.uniform1f(lightLoc.toonThr, lightsInfo[bID].toonThr);
        gl.uniform1f(lightLoc.phongShiny, lightsInfo[bID].phongShiny);
        gl.uniform1f(lightLoc.blinnShiny, lightsInfo[bID].blinnShiny);
        gl.uniform1f(lightLoc.toonPThr, lightsInfo[bID].toonPThr);
        gl.uniform1f(lightLoc.toonBThr, lightsInfo[bID].toonBThr);
    },

}
function typeToFloat(type) {
    if (type == "direct" || type == "ambient" || type == "lambert" || type == "phong") {
        return 0.0;
    } else if (type == "point" || type == "hemispheric" || type == "toon" || type == "blinn") {
        return 1.0;
    } else if (type == "spot" || type == "toonPhong") {
        return 2.0;
    } else if (type == "toonBlinn") {
        return 3.0;
    } else {
        // Default case = none
        return 4.0;
    }
  }
  function extendColor(color) {
      let out = new Float32Array([color[0], color[1], color[2], 1.0]);
      return out;
  }
