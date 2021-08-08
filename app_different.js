var program;
var gl;
var shaderDir;
var baseDir;
var boatModel;
var pedestalModel;

function main() {

    //define directional light
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

    var lastUpdateTime = (new Date).getTime();

    var cubeRx = 90.0; //yaw?
    var cubeRy = 0.0; //roll?
    var cubeRz = 0.0; //pitch?
    var cubeS = 0.5;

    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    var positionAttributeLocation = new Array();
    var normalAttributeLocation = new Array();
    var uvAttributeLocation = new Array();

    var materialDiffColorHandle = new Array();
    var lightColorHandle = new Array();

    var lightDirectionHandle = new Array();

    var lightPosHandle = new Array();
    var lightTargetHandle = new Array();
    var lightDecayHandle = new Array();

    var normalMatrixPositionHandle = new Array();
    var vertexMatrixPositionHandle = new Array();
    var matrixLocation = new Array();

    var texturePositionHandle = new Array();
    var texture = new Array();


    for(let i = 0; i < 2; i++) {
        positionAttributeLocation[i] = gl.getAttribLocation(program, "in_position");
        normalAttributeLocation[i] = gl.getAttribLocation(program, "in_normal");
        uvAttributeLocation[i] = gl.getAttribLocation(program, "in_uv");

        materialDiffColorHandle[i] = gl.getUniformLocation(program, 'mDiffColor');
        lightColorHandle[i] = gl.getUniformLocation(program, 'lightColor');

        lightDirectionHandle[i] = gl.getUniformLocation(program, 'lightDirection');

        lightPosHandle[i] = gl.getUniformLocation(program, "lightPos");
        lightTargetHandle[i] = gl.getUniformLocation(program, "lightTarget");
        lightDecayHandle[i] = gl.getUniformLocation(program, "lightDecay");

        normalMatrixPositionHandle[i] = gl.getUniformLocation(program, "nMatrix");
        vertexMatrixPositionHandle[i] = gl.getUniformLocation(program, "pMatrix");
        matrixLocation[i] = gl.getUniformLocation(program, "matrix");

        texturePositionHandle[i] = gl.getUniformLocation(program, "u_texture");
    }

    var perspectiveMatrix = utils.MakePerspective(45, gl.canvas.width / gl.canvas.height, 0.1, 100.0);

    var vaos = new Array();

    for(let i = 0; i < 2; i++) {
        vaos[i] = gl.createVertexArray();
        gl.bindVertexArray(vaos[i]);

        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelVertices[i]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttributeLocation[i]);
        gl.vertexAttribPointer(positionAttributeLocation[i], 3, gl.FLOAT, false, 0, 0);

        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelNormals[i]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(normalAttributeLocation[i]);
        gl.vertexAttribPointer(normalAttributeLocation[i], 3, gl.FLOAT, false, 0, 0);

        var uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelTexCoords[i]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(uvAttributeLocation[i]);
        gl.vertexAttribPointer(uvAttributeLocation[i], 2, gl.FLOAT, false, 0, 0);

        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelIndices[i]), gl.STATIC_DRAW);
    }

    texture[0] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture[0]);

    // Asynchronously load an image
    var image0 = new Image();
    image0.src = baseDir + "assets/boat/boat_diffuse_png.png";
    image0.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture[0]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image0);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.generateMipmap(gl.TEXTURE_2D);
    };

    texture[1] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture[1]);

    // Asynchronously load an image
    /*var image1 = new Image();
    image1.src = baseDir + "assets/pedestal/pedestal2.png";
    image1.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture[1]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.generateMipmap(gl.TEXTURE_2D);
    };*/

    drawScene();

    // function animate() {
    //     var currentTime = (new Date).getTime();
    //     if (lastUpdateTime) {
    //         var deltaC = (30 * (currentTime - lastUpdateTime)) / 1000.0;
    //         cubeRx += deltaC;
    //         cubeRy -= deltaC;
    //         cubeRz += deltaC;
    //     }
    //     cubeWorldMatrix[3] = utils.MakeWorldNonUnif(0.0, 0.0, 0.0, cubeRx, cubeRy, cubeRz, 1.0, 2.0, 1.0);
    //     lastUpdateTime = currentTime;
    // }


    function drawScene() {
        //animate();

        utils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        var viewMatrix;
        var viewWorldMatrix;
        var projectionMatrix;
        var normalMatrix;
        var dirLightTransformed;
        var lightPosTransformed;
        for (let i = 0; i < 2; i++) {
            viewMatrix = utils.MakeView(0.0, 10.0, 15.0, -15.0, 0.0);
            viewWorldMatrix = utils.multiplyMatrices(viewMatrix, worldMatrix[i]);

            projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
            gl.uniformMatrix4fv(matrixLocation[i], gl.FALSE, utils.transposeMatrix(projectionMatrix));

            gl.uniformMatrix4fv(vertexMatrixPositionHandle[i], gl.FALSE, utils.transposeMatrix(viewWorldMatrix));

            normalMatrix = utils.invertMatrix(utils.transposeMatrix(viewWorldMatrix));
            gl.uniformMatrix4fv(normalMatrixPositionHandle[i], gl.FALSE, utils.transposeMatrix(normalMatrix));

            dirLightTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4(viewMatrix), directionalLight);
            gl.uniform3fv(lightDirectionHandle[i], dirLightTransformed);

            lightPosTransformed = utils.multiplyMatrixVector(viewMatrix, lightPos);
            gl.uniform3fv(lightPosHandle[i], lightPosTransformed.slice(0,3));

            gl.uniform3fv(materialDiffColorHandle[i], materialColor);
            gl.uniform3fv(lightColorHandle[i], directionalLightColor);

            gl.uniform1f(lightTargetHandle[i], lightTarget);
            gl.uniform1f(lightDecayHandle[i], lightDecay);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture[i]);
            gl.uniform1i(texturePositionHandle[i], 0);

            gl.bindVertexArray(vaos[i]);
            gl.drawElements(gl.TRIANGLES, modelIndices[i].length, gl.UNSIGNED_SHORT, 0);
        }

        window.requestAnimationFrame(drawScene);
    }

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

    modelVertices = new Array();
    modelNormals = new Array();
    modelIndices = new Array();
    modelTexCoords = new Array();
    worldMatrix = new Array();

    var boatStr = await utils.get_objstr(baseDir + "assets/boat/boat.obj");
    boatModel = new OBJ.Mesh(boatStr);
    modelVertices[0] = boatModel.vertices; //Array of vertices
    modelNormals[0] = boatModel.vertexNormals; //Array of normals
    modelIndices[0] = boatModel.indices; //Array of indices
    modelTexCoords[0] = boatModel.textures; //Array of uv coordinates
    worldMatrix[0] = utils.MakeWorld(0.0, 4.0, -15.0, 90, 0, 0, 0.0125);

    var pedestalStr = await utils.get_objstr(baseDir + "assets/pedestal/pedestal.obj");
    pedestalModel = new OBJ.Mesh(pedestalStr);
    modelVertices[1] = pedestalModel.vertices; //Array of vertices
    modelNormals[1] = pedestalModel.vertexNormals; //Array of normals
    modelIndices[1] = pedestalModel.indices; //Array of indices
    modelTexCoords[1] = pedestalModel.textures; //Array of uv coordinates
    worldMatrix[1] = utils.MakeWorld(0.0, 0.0, -15.0, 90, 0, 0, 0.5);

    gl.useProgram(program);

    main();
}

window.onload = init;
