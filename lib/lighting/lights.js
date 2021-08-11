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
        this.mDiffColor = null;
        this.dirColor = null;
        this.dirDirection = null;
        this.pointPos = null;
        this.pointDecay = null;
        this.pointTarget = null;
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
        // lightLocation[obj].lightType = gl.getUniformLocation(obj.drawInfo.programInfo, 'lightType');
        // lightLocation[obj].lightAmbient = gl.getUniformLocation(obj.drawInfo.programInfo, 'lightAmbient');
        // lightLocation[obj].lightDiffuse = gl.getUniformLocation(obj.drawInfo.programInfo, 'lightDiffuse');
        // lightLocation[obj].lightSpecular = gl.getUniformLocation(obj.drawInfo.programInfo, 'lightSpecular');

        obj.drawInfo.lightLocation.mDiffColor = gl.getUniformLocation(obj.drawInfo.programInfo, 'mDiffColor');
        obj.drawInfo.lightLocation.dirColor = gl.getUniformLocation(obj.drawInfo.programInfo, 'dirColor');
        // lightLocation[obj].pointLightColor = gl.getUniformLocation(obj.drawInfo.programInfo, 'pointColor');
        // lightLocation[obj].spotLightColor = gl.getUniformLocation(obj.drawInfo.programInfo, 'spotColor');
        // lightLocation[obj].ambientColor = gl.getUniformLocation(obj.drawInfo.programInfo, 'ambientColor');
        // lightLocation[obj].ambientLowerColor = gl.getUniformLocation(obj.drawInfo.programInfo, 'ambientLowerColor');
        // lightLocation[obj].ambientUpperColor = gl.getUniformLocation(obj.drawInfo.programInfo, 'ambientUpperColor');
        // lightLocation[obj].lambertColor = gl.getUniformLocation(obj.drawInfo.programInfo, 'lambertColor');
        // lightLocation[obj].toonColor = gl.getUniformLocation(obj.drawInfo.programInfo, 'toonColor');
        // lightLocation[obj].phongColor = gl.getUniformLocation(obj.drawInfo.programInfo, 'phongColor');
        // lightLocation[obj].blinnColor = gl.getUniformLocation(obj.drawInfo.programInfo, 'blinnColor');
        // lightLocation[obj].toonPColor = gl.getUniformLocation(obj.drawInfo.programInfo, 'toonPColor');
        // lightLocation[obj].toonBColor = gl.getUniformLocation(obj.drawInfo.programInfo, 'toonBColor');

        obj.drawInfo.lightLocation.dirDirection = gl.getUniformLocation(obj.drawInfo.programInfo, 'dirDirection');
        obj.drawInfo.lightLocation.pointPos = gl.getUniformLocation(obj.drawInfo.programInfo, 'pointPos');
        obj.drawInfo.lightLocation.pointDecay = gl.getUniformLocation(obj.drawInfo.programInfo, 'pointDecay');
        obj.drawInfo.lightLocation.pointTarget = gl.getUniformLocation(obj.drawInfo.programInfo, 'pointTarget');
        // lightLocation[obj].spotPosY = gl.getUniformLocation(obj.drawInfo.programInfo, 'spotPosY');
        // lightLocation[obj].spotDecay = gl.getUniformLocation(obj.drawInfo.programInfo, 'spotDecay');
        // lightLocation[obj].spotTarget = gl.getUniformLocation(obj.drawInfo.programInfo, 'spotTarget');
        // lightLocation[obj].spotDir = gl.getUniformLocation(obj.drawInfo.programInfo, 'spotDir');
        // lightLocation[obj].spotConeIn = gl.getUniformLocation(obj.drawInfo.programInfo, 'spotConeIn');
        // lightLocation[obj].spotConeOut = gl.getUniformLocation(obj.drawInfo.programInfo, 'spotConeOut');
        // lightLocation[obj].hemisphericDir = gl.getUniformLocation(obj.drawInfo.programInfo, 'hemisphericDir');
        // lightLocation[obj].lambertTexture = gl.getUniformLocation(obj.drawInfo.programInfo, 'lambertTexture');
        // lightLocation[obj].toonTexture = gl.getUniformLocation(obj.drawInfo.programInfo, 'toonTexture');
        // lightLocation[obj].toonThr = gl.getUniformLocation(obj.drawInfo.programInfo, 'toonThr');
        // lightLocation[obj].phongShiny = gl.getUniformLocation(obj.drawInfo.programInfo, 'phongShiny');
        // lightLocation[obj].blinnShiny = gl.getUniformLocation(obj.drawInfo.programInfo, 'blinnShiny');
        // lightLocation[obj].toonPThr = gl.getUniformLocation(obj.drawInfo.programInfo, 'toonPThr');
        // lightLocation[obj].toonBThr = gl.getUniformLocation(obj.drawInfo.programInfo, 'toonBThr');
    },

    setLightValues: function (obj) {
        gl.useProgram(obj.drawInfo.programInfo);

        // Helper Variables
        // gl.uniform1f(lightLocation[obj].lightType, typeToFloat(lights[obj].lightType));
        // gl.uniform1f(lightLocation[obj].lightAmbient, typeToFloat(lights[obj].lightAmbient));
        // gl.uniform1f(lightLocation[obj].lightDiffuse, typeToFloat(lights[obj].lightDiffuse));
        // gl.uniform1f(lightLocation[obj].lightSpecular, typeToFloat(lights[obj].lightSpecular));

        gl.uniform3fv(obj.drawInfo.lightLocation.mDiffColor, /*lights[obj].dirColor*/materialColor);
        // Colors
        gl.uniform3fv(obj.drawInfo.lightLocation.dirColor, /*lights[obj].dirColor*/directionalLightColor);
        // gl.uniform4fv(lightLocation[obj].pointColor, extendColor(lights[obj].pointColor));
        // gl.uniform4fv(lightLocation[obj].spotColor, extendColor(lights[obj].spotColor));
        // gl.uniform4fv(lightLocation[obj].ambientColor, extendColor(lights[obj].ambientColor));
        // gl.uniform4fv(lightLocation[obj].ambientLowerColor, extendColor(lights[obj].ambientLowerColor));
        // gl.uniform4fv(lightLocation[obj].ambientUpperColor, extendColor(lights[obj].ambientUpperColor));
        // gl.uniform4fv(lightLocation[obj].lambertColor, extendColor(lights[obj].lambertColor));
        // gl.uniform4fv(lightLocation[obj].toonColor, extendColor(lights[obj].toonColor));
        // gl.uniform4fv(lightLocation[obj].phongColor, extendColor(lights[obj].phongColor));
        // gl.uniform4fv(lightLocation[obj].blinnColor, extendColor(lights[obj].blinnColor));
        // gl.uniform4fv(lightLocation[obj].toonPColor, extendColor(lights[obj].toonPColor));
        // gl.uniform4fv(lightLocation[obj].toonBColor, extendColor(lights[obj].toonBColor));

        // Other variables
        /*let dir = [Math.sin(utils.degToRad(lights[obj].directTheta)) * Math.sin(utils.degToRad(lights[obj].directPhi)),
        Math.cos(utils.degToRad(lights[obj].directTheta)),
        Math.sin(utils.degToRad(lights[obj].directTheta)) * Math.cos(utils.degToRad(lights[obj].directPhi))];*/
        var dirLightTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4(viewMatrix), directionalLight);
        gl.uniform3fv(obj.drawInfo.lightLocation.dirDirection, dirLightTransformed);

        var lightPosTransformed = utils.multiplyMatrixVector(viewMatrix, lightPos);
        gl.uniform3fv(obj.drawInfo.lightLocation.pointPos, lightPosTransformed.slice(0, 3)/*lights[obj].pointPosX * 100, lights[obj].pointPosY * 100, lights[obj].pointPosZ * 100*/);
        gl.uniform1f(obj.drawInfo.lightLocation.pointDecay, lightDecay/*lights[obj].pointDecay*/);
        gl.uniform1f(obj.drawInfo.lightLocation.pointTarget, lightTarget/*lights[obj].pointTarget * 400*/);
        // gl.uniform1f(lightLocation[obj].spotPosY, lights[obj].spotPosY);
        // gl.uniform1f(lightLocation[obj].spotDecay, lights[obj].spotDecay);
        // gl.uniform1f(lightLocation[obj].spotTarget, lights[obj].spotTarget);

        // dir = [Math.sin(utils.degToRad(lights[obj].spotTheta)) * Math.sin(utils.degToRad(lights[obj].spotPhi)),
        // Math.cos(utils.degToRad(lights[obj].spotTheta)),
        // Math.sin(utils.degToRad(lights[obj].spotTheta)) * Math.cos(utils.degToRad(lights[obj].spotPhi))];
        // gl.uniform3fv(lightLocation[obj].spotDir, dir);

        // gl.uniform1f(lightLocation[obj].spotConeIn, lights[obj].spotConeIn);
        // gl.uniform1f(lightLocation[obj].spotConeOut, lights[obj].spotConeOut);

        // gl.uniform3f(lightLocation[obj].hemisphericDir,
        //     Math.sin(utils.degToRad(lights[obj].hemisphericTheta)) * Math.sin(utils.degToRad(lights[obj].hemisphericPhi)),
        //     Math.cos(utils.degToRad(lights[obj].hemisphericTheta)),
        //     Math.sin(utils.degToRad(lights[obj].hemisphericTheta)) * Math.cos(utils.degToRad(lights[obj].hemisphericPhi)));

        // gl.uniform1f(lightLocation[obj].lambertTexture, lights[obj].lambertTexture / 100);
        // gl.uniform1f(lightLocation[obj].toonTexture, lights[obj].toonTexture / 100);
        // gl.uniform1f(lightLocation[obj].toonThr, lights[obj].toonThr);
        // gl.uniform1f(lightLocation[obj].phongShiny, lights[obj].phongShiny);
        // gl.uniform1f(lightLocation[obj].blinnShiny, lights[obj].blinnShiny);
        // gl.uniform1f(lightLocation[obj].toonPThr, lights[obj].toonPThr);
        // gl.uniform1f(lightLocation[obj].toonBThr, lights[obj].toonBThr);
    },

    extendColor: function(color) {
        let out = new Float32Array([color[0], color[1], color[2], 1.0]); 
        return out;
    }
}
