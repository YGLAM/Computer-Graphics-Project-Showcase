var program;
var gl;
var shaderDir;
var baseDir;
var objModel;

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

    var positionAttributeLocation = gl.getAttribLocation(program, "in_position");
    var normalAttributeLocation = gl.getAttribLocation(program, "in_normal");
    var uvAttributeLocation = gl.getAttribLocation(program, "in_uv");

    var materialDiffColorHandle = gl.getUniformLocation(program, 'mDiffColor');
    var lightColorHandle = gl.getUniformLocation(program, 'lightColor');

    var lightDirectionHandle = gl.getUniformLocation(program, 'lightDirection');

    var lightPosHandle = gl.getUniformLocation(program, "lightPos");
    var lightTargetHandle = gl.getUniformLocation(program, "lightTarget");
    var lightDecayHandle = gl.getUniformLocation(program, "lightDecay");

    var normalMatrixPositionHandle = gl.getUniformLocation(program, "nMatrix");
    var vertexMatrixPositionHandle = gl.getUniformLocation(program, "pMatrix");
    var matrixLocation = gl.getUniformLocation(program, "matrix");

    var texturePositionHandle = gl.getUniformLocation(program, "u_texture");

    var perspectiveMatrix = utils.MakePerspective(45, gl.canvas.width / gl.canvas.height, 0.1, 100.0);

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelVertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelNormals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelTexCoords), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(uvAttributeLocation);
    gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelIndices), gl.STATIC_DRAW);

    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Asynchronously load an image
    var image = new Image();
    image.src = baseDir + "assets/pedestal/pedestal2.png";
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.generateMipmap(gl.TEXTURE_2D);
    };

    drawScene();

    function animate() {
        var currentTime = (new Date).getTime();
        if (lastUpdateTime) {
            var deltaC = (30 * (currentTime - lastUpdateTime)) / 1000.0;
            cubeRx += deltaC;
            cubeRy -= deltaC;
            cubeRz += deltaC;
        }
        cubeWorldMatrix[3] = utils.MakeWorldNonUnif(0.0, 0.0, 0.0, cubeRx, cubeRy, cubeRz, 1.0, 2.0, 1.0);
        lastUpdateTime = currentTime;
    }


    function drawScene() {
        //animate();

        utils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        var worldMatrix = new Array();
        var viewMatrix;
        var viewWorldMatrix;
        var projectionMatrix;
        var normalMatrix;
        var dirLightTransformed;
        var lightPosTransformed;
        for (let i = 0; i < 3; i++) {
            worldMatrix[i] = utils.MakeWorld(15.0 * (i - 1), 0.0, -15.0, cubeRx, cubeRy, cubeRz, 0.5);
            viewMatrix = utils.MakeView(0.0, 5.0, 15.0, 0.0, 0.0);
            viewWorldMatrix = utils.multiplyMatrices(viewMatrix, worldMatrix[i]);

            projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
            gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));

            gl.uniformMatrix4fv(vertexMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(viewWorldMatrix));

            normalMatrix = utils.invertMatrix(utils.transposeMatrix(viewWorldMatrix));
            gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));

            dirLightTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4(viewMatrix), directionalLight);
            gl.uniform3fv(lightDirectionHandle, dirLightTransformed);

            lightPosTransformed = utils.multiplyMatrixVector(viewMatrix, lightPos);
            gl.uniform3fv(lightPosHandle, lightPosTransformed.slice(0,3));

            gl.uniform3fv(materialDiffColorHandle, materialColor);
            gl.uniform3fv(lightColorHandle, directionalLightColor);

            gl.uniform1f(lightTargetHandle, lightTarget);
            gl.uniform1f(lightDecayHandle, lightDecay);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(texturePositionHandle, 0);

            gl.bindVertexArray(vao);
            gl.drawElements(gl.TRIANGLES, modelIndices.length, gl.UNSIGNED_SHORT, 0);
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

    var objStr = await utils.get_objstr(baseDir + "assets/pedestal/pedestal.obj");
    objModel = new OBJ.Mesh(objStr);
    modelVertices = objModel.vertices; //Array of vertices
    modelNormals = objModel.vertexNormals; //Array of normals
    modelIndices = objModel.indices; //Array of indices
    modelTexCoords = objModel.textures; //Array of uv coordinates
    gl.useProgram(program);

    main();
}

window.onload = init;

