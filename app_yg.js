var main = function() {

    //define directional light, shouldn't these parameters go to the fragment Shader ?
    var dirLightAlpha = -utils.degToRad(60);
    var dirLightBeta = -utils.degToRad(120);

    var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
                            Math.sin(dirLightAlpha),
                            Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)];
    var directionalLightColor = [0.85, 0.85, 0.85];

    var lightPos = [20.0, 3.0, 0.0, 1.0];
    var lightTarget = 10;
    var lightDecay = 0;

    //Define material color
    var materialColor = [0.5, 0.5, 0.5];

    // Asynchronously load an image
    requestAnimationFrame(cameraScene);



    function cameraScene(){
      //Placeholder light parameters -- START
    var dirLightAlpha = -utils.degToRad(60);
    var dirLightBeta  = -utils.degToRad(120);

    var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
                Math.sin(dirLightAlpha),
                Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
                ];
    var directionalLightColor = [0.1, 1.0, 1.0];
    var cubeMaterialColor = [0.5, 0.5, 0.5];

    var materialDiffColorHandle = gl.getUniformLocation(program, 'mDiffColor');
    var lightDirectionHandle = gl.getUniformLocation(program, 'lightDirection');
    var lightColorHandle = gl.getUniformLocation(program, 'lightColor');
      //END
    //console.log("roomPositionNode:"+ roomPositionNode);
    roomPositionNode.updateWorldMatrix();
    var aspect = gl.canvas.width / gl.canvas.height;
    var perspectiveMatrix = utils.MakePerspective(90, aspect, 0.1, 100.0);
    var viewMatrix = utils.MakeView(3.0,3.0,2.5,-45.0,-40.0);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    entities.forEach(function(entity){
      gl.useProgram(entity.drawInfo.programInfo);

      var viewWorldMatrix = utils.multiplyMatrices(viewMatrix,entity.worldMatrix);
      var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);

      var normalMatrix = utils.invertMatrix(utils.transposeMatrix(viewWorldMatrix));
      gl.uniformMatrix4fv(entity.drawInfo.normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));
      gl.uniformMatrix4fv(entity.drawInfo.matrixLocation,gl.FALSE, utils.transposeMatrix(projectionMatrix));

      var dirLightTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4(viewMatrix), directionalLight);

      gl.uniform3fv(lightDirectionHandle,  dirLightTransformed);
      gl.uniform3fv(materialDiffColorHandle, cubeMaterialColor);
      gl.uniform3fv(lightColorHandle,  directionalLightColor);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D,entity.drawInfo.textureRef[0]);
      gl.uniform1i(entity.drawInfo.textLocation,0);
      gl.bindVertexArray(entity.drawInfo.vertexArray);
      gl.drawElements(gl.TRIANGLES, entity.drawInfo.indices.length,gl.UNSIGNED_SHORT,0);
      });
      window.requestAnimationFrame(cameraScene);
    }
    window.requestAnimationFrame(cameraScene);
}


var init = async function() {

    var path = window.location.pathname;
    var page = path.split("/").pop();
    baseDir = window.location.href.replace(page, '');
    shaderDir = baseDir + "shaders/";

    var canvas = document.getElementById("my-canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        document.write("GL context not opened");
        return;
    }
    loadProgram();
    nodes.loadSceneAssets();
    gl.useProgram(program);
    await nodes.sceneGraph();
    main();
}
async function loadProgram(){
  await utils.loadFiles([shaderDir + '/vertices/vs.glsl', shaderDir + 'fragments/fs.glsl'],
   function (shaderText) {
      var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
      var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
      program = utils.createProgram(gl, vertexShader, fragmentShader);
  });
}

window.onload = init;
