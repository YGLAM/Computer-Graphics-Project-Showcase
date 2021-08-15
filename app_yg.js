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
    window.addEventListener("mouseup", myOnMouseUp, false);

    cameraScene();

    function animate() {
        var currentTime = (new Date).getTime();
        if (lastUpdateTime) {
            var dt = (30 * (currentTime - lastUpdateTime)) / 1000.0;
        }

        entities.forEach(function (entity) {
            if (entity.drawInfo.name == "boat") {
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
            switch (e.keyCode) {
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
            switch (e.keyCode) {
                case 27:    // Escape
                    cx = 0.0;
                    cy = 20.0;
                    cz = 35.0;
                    angleV = -20.0;
                    zoom = false;
                    break;
            }
        }
    }

    //This algorithm is taken from the book Real Time Rendering fourth edition
    function raySphereIntersection(rayStartPoint, rayNormalisedDir, sphereCentre, sphereRadius) {
        //Distance between sphere origin and origin of ray
        var l = [sphereCentre[0] - rayStartPoint[0], sphereCentre[1] - rayStartPoint[1], sphereCentre[2] - rayStartPoint[2]];
        var l_squared = l[0] * l[0] + l[1] * l[1] + l[2] * l[2];
        //If this is true, the ray origin is inside the sphere so it collides with the sphere
        if (l_squared < (sphereRadius * sphereRadius)) {
            console.log("ray origin inside sphere");
            return true;
        }
        //Projection of l onto the ray direction 
        var s = l[0] * rayNormalisedDir[0] + l[1] * rayNormalisedDir[1] + l[2] * rayNormalisedDir[2];
        //The spere is behind the ray origin so no intersection
        if (s < 0) {
            console.log("sphere behind ray origin");
            return false;
        }
        //Squared distance from sphere centre and projection s with Pythagorean theorem
        var m_squared = l_squared - (s * s);
        //If this is true the ray will miss the sphere
        if (m_squared > (sphereRadius * sphereRadius)) {
            console.log("m squared > r squared");
            return false;
        }
        //Now we can say that the ray will hit the sphere 
        console.log("hit");
        return true;

    }

    function normaliseVector(vec) {
        var magnitude = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
        console.log("Magnitude" + magnitude);
        var normVec = [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude];
        return normVec;
    }

    function myOnMouseUp(ev) {
        if (!zoom) {
            //These commented lines of code only work if the canvas is full screen
            /*console.log("ClientX "+ev.clientX+" ClientY "+ev.clientY);
            var normX = (2*ev.clientX)/ gl.canvas.width - 1;
            var normY = 1 - (2*ev.clientY) / gl.canvas.height;
            console.log("NormX "+normX+" NormY "+normY);*/

            //This is a way of calculating the coordinates of the click in the canvas taking into account its possible displacement in the page
            var top = 0.0, left = 0.0;
            canvas = gl.canvas;
            while (canvas && canvas.tagName !== 'BODY') {
                top += canvas.offsetTop;
                left += canvas.offsetLeft;
                canvas = canvas.offsetParent;
            }
            console.log("left " + left + " top " + top);
            var x = ev.clientX - left;
            var y = ev.clientY - top;

            //Here we calculate the normalised device coordinates from the pixel coordinates of the canvas
            console.log("ClientX " + x + " ClientY " + y);
            var normX = (2 * x) / gl.canvas.width - 1;
            var normY = 1 - (2 * y) / gl.canvas.height;
            console.log("NormX " + normX + " NormY " + normY);

            //We need to go through the transformation pipeline in the inverse order so we invert the matrices
            var projInv = utils.invertMatrix(perspectiveMatrix);
            var viewInv = utils.invertMatrix(viewMatrix);

            //Find the point (un)projected on the near plane, from clip space coords to eye coords
            //z = -1 makes it so the point is on the near plane
            //w = 1 is for the homogeneous coordinates in clip space
            var pointEyeCoords = utils.multiplyMatrixVector(projInv, [normX, normY, -1, 1]);
            console.log("Point eye coords " + pointEyeCoords);

            //This finds the direction of the ray in eye space
            //Formally, to calculate the direction you would do dir = point - eyePos but since we are in eye space eyePos = [0,0,0] 
            //w = 0 is because this is not a point anymore but is considered as a direction
            var rayEyeCoords = [pointEyeCoords[0], pointEyeCoords[1], pointEyeCoords[2], 0];


            //We find the direction expressed in world coordinates by multipling with the inverse of the view matrix
            var rayDir = utils.multiplyMatrixVector(viewInv, rayEyeCoords);
            console.log("Ray direction " + rayDir);
            var normalisedRayDir = normaliseVector(rayDir);
            console.log("normalised ray dir " + normalisedRayDir);
            //The ray starts from the camera in world coordinates
            var rayStartPoint = [cx, cy, cz];

            entities.forEach(function (entity) {
                if (entity.drawInfo.name == "boat") {
                    var pos = [entity.worldMatrix[3], entity.worldMatrix[7], entity.worldMatrix[11]];
                    console.log("entity position: " + pos);
                    var hit = raySphereIntersection(rayStartPoint, normalisedRayDir, pos, 5.0);
                    if (hit) {
                        console.log("hit entity number " + entity.id);
                        cx = entity.worldMatrix[3];
                        cy = 13.0;
                        cz = 15.0;
                        angleV = -15.0;
                        zoom = true;
                    }
                }
            });
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
