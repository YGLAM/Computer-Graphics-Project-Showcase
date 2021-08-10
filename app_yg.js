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
    nodes.sceneGraph();
    // Asynchronously load an image
    draw.cameraScene();
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

    main();
}
async function loadProgram(){
  await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'],
   function (shaderText) {
      var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
      var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
      program = utils.createProgram(gl, vertexShader, fragmentShader);
  });
}

window.onload = init;
