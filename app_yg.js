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
    var lightPos = [20.0, 3.0, 0.0, 1.0];
    var lightTarget = 10;
    var lightDecay = 0;

    var lastUpdateTime = (new Date).getTime();

    var zoom = false;
    var cx = 0.0, cy = 20.0, cz = 35.0;
    var angleV = -20.0, angleO = 0.0;

    window.addEventListener("keyup", keyFunction, false);

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
      }
    function cameraScene() {
        aspect = gl.canvas.width / gl.canvas.height;
        perspectiveMatrix = utils.MakePerspective(60, aspect, 0.1, 100.0);
        viewMatrix = utils.MakeView(cx, cy, cz, angleV, angleO);

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

            lights.setLightValues(entity);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, entity.drawInfo.textureRef[0]);
            gl.uniform1i(entity.drawInfo.textLocation, 0);

            gl.bindVertexArray(entity.drawInfo.vertexArray);
            gl.drawElements(gl.TRIANGLES, entity.drawInfo.indices.length, gl.UNSIGNED_SHORT, 0);
        });

        window.requestAnimationFrame(cameraScene);
    }

    function keyFunction(e) {
        // If the view is not zoomed on a boat, I can zoom on a boat 
        if (!zoom) {
            // Set viewMatrix to zoom on a certain boat and set zoom to true
            switch(e.keyCode) {
                case 49:    // 1
                    cx = -15.0;
                    cy = 13.0;
                    cz = 15.0;
                    angleV = -15.0;
                    zoom = true;
                    break;
                case 50:    // 2
                    cx = 0.0;
                    cy = 13.0;
                    cz = 15.0;
                    angleV = -15.0;
                    zoom = true;
                    break;
                case 51:    // 3
                    cx = 15.0;
                    cy = 13.0;
                    cz = 15.0;
                    angleV = -15.0;
                    zoom = true;
                    break;
            }
        }

        // If the view is on a boat, I can only press "esc" to reset it
        else /*if (zoom)*/ { 
            // Reset viewMatrix, set zoom to false and empty keys array
            switch(e.keyCode) {
                case 27:    // Escape
                    cx = 0.0;
                    cy = 20.0;
                    cz = 35.0;
                    angleV = -20.0
                    zoom = false;
                    break; 
            }
        }
    }
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
//program creation was once here
    await nodes.loadSceneAssets();
    // gl.useProgram(program);

    jp.parseLights();
    await nodes.buildSceneGraph();
    main();
}

window.onload = init;
