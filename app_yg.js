var program;
var gl;
var shaderDir;
var baseDir;
var objModel;

function main() {

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
    var cubeS = 0.5;

    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);


    var perspectiveMatrix = utils.MakePerspective(90, gl.canvas.width / gl.canvas.height, 0.1, 100.0);


    // Asynchronously load an image
    var image = new Image();
    image.src = baseDir + "assets/boat/boat_diffuse_png.png";
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.generateMipmap(gl.TEXTURE_2D);
    };

    draw.scene();
}


async function init() {

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

    await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        console.log("vs: " + vertexShader);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
        console.log("fs: " + fragmentShader);
        program = utils.createProgram(gl, vertexShader, fragmentShader);
    });
    //Loads Up every single object into a list
    //Still to do 
    objModel = utils.initObject(baseDir + "assets/boat/boat.obj");
    gl.useProgram(program);

    main();
}

window.onload = init;
