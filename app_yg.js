var main = function () {

    var dirLightAlpha = -utils.degToRad(60);
    var dirLightBeta = -utils.degToRad(120);

    var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
    Math.sin(dirLightAlpha),
    Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
    ];
    var directionalLightColor = [0.85, 0.85, 0.85];
    var materialColor = [0.5, 0.5, 0.5];

    console.log(entities);
    // For each entity, link its light locations to the variables of the fragment shader
    entities.forEach(function (entity) {
        console.log(entity);
        gl.useProgram(entity.drawInfo.programInfo);
        //object = retrieveAsset(entity.drawInfo.name);
        lights.lightLocations(entity);
    });
    // var materialDiffColorHandle = gl.getUniformLocation(program, 'mDiffColor');
    // var lightColorHandle = gl.getUniformLocation(program, 'lightColor');

    // var lightDirectionHandle = gl.getUniformLocation(program, 'lightDirection');

    // var lightPosHandle = gl.getUniformLocation(program, "lightPos");
    // var lightTargetHandle = gl.getUniformLocation(program, "lightTarget");
    // var lightDecayHandle = gl.getUniformLocation(program, "lightDecay");

    var lightPos = [20.0, 3.0, 0.0, 1.0];
    var lightTarget = 10;
    var lightDecay = 0;

    var lastUpdateTime = (new Date).getTime();
    cameraScene();

    function animate() {
        var currentTime = (new Date).getTime();
        if (lastUpdateTime) {
            var dt = (30 * (currentTime - lastUpdateTime)) / 1000.0;
        }

        entities.forEach(function (entity) {
            if(entity.drawInfo.name == "boat") {
                entity.localMatrix = utils.multiplyMatrices(utils.MakeRotateYMatrix(dt), entity.localMatrix);
            }
        });

        lastUpdateTime = currentTime;

        // var currentTime = (new Date).getTime();
        // if (lastUpdateTime) {
        //     var deltaC = (30 * (currentTime - lastUpdateTime)) / 1000.0;
        //     cubeRx += deltaC;
        //     cubeRy -= deltaC;
        //     cubeRz += deltaC;
        // }
        // cubeWorldMatrix[3] = utils.MakeWorldNonUnif(0.0, 0.0, 0.0, cubeRx, cubeRy, cubeRz, 1.0, 2.0, 1.0);
        // lastUpdateTime = currentTime;
    }

    function cameraScene() {
        aspect = gl.canvas.width / gl.canvas.height;
        perspectiveMatrix = utils.MakePerspective(60, aspect, 0.1, 100.0);
        viewMatrix = utils.MakeView(0.0, 20.0, 35.0, -20.0, 0.0);

        utils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        animate();
        roomPositionNode.updateWorldMatrix();

        entities.forEach(function (entity) {
            gl.useProgram(entity.drawInfo.programInfo);

            viewWorldMatrix = utils.multiplyMatrices(viewMatrix, entity.worldMatrix);
            projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
            gl.uniformMatrix4fv(entity.drawInfo.matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));

            gl.uniformMatrix4fv(entity.drawInfo.vertexMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(viewWorldMatrix));//Needs to be reviewed

            normalMatrix = utils.invertMatrix(utils.transposeMatrix(viewWorldMatrix));
            gl.uniformMatrix4fv(entity.drawInfo.normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));


            //object = retrieveAsset(entity.drawInfo.name);
            lights.setLightValues(entity);
            // var dirLightTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4(viewMatrix), directionalLight);
            // gl.uniform3fv(lightDirectionHandle, dirLightTransformed);

            // var lightPosTransformed = utils.multiplyMatrixVector(viewMatrix, lightPos);
            // gl.uniform3fv(lightPosHandle, lightPosTransformed.slice(0, 3));
            // gl.uniform1f(lightTargetHandle, lightTarget);
            // gl.uniform1f(lightDecayHandle, lightDecay);

            // gl.uniform3fv(materialDiffColorHandle, materialColor);
            // gl.uniform3fv(lightColorHandle, directionalLightColor);


            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, entity.drawInfo.textureRef[0]);
            gl.uniform1i(entity.drawInfo.textLocation, 0);

            gl.bindVertexArray(entity.drawInfo.vertexArray);
            gl.drawElements(gl.TRIANGLES, entity.drawInfo.indices.length, gl.UNSIGNED_SHORT, 0);
        });

        window.requestAnimationFrame(cameraScene);
    }
    //window.requestAnimationFrame(cameraScene);
}

var init = async function () {

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


    await utils.loadFiles([shaderDir + '/vertices/vs.glsl', shaderDir + 'fragments/fs_boat.glsl'],
    function (shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        console.log("vs: " + vertexShader);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
        console.log("fs: " + fragmentShader);
        program = utils.createProgram(gl, vertexShader, fragmentShader);
    });
    await nodes.loadSceneAssets();
    gl.useProgram(program);

    jp.parseLights();
    await nodes.buildSceneGraph();
    main();
}

window.onload = init;
