var zoom = false;
//maybe we need to move or parametrize these ones..
var resetx= 0.0, resety=20.0,resetz=35.0;
var cx = 0.0, cy = 20.0, cz = 35.0;
var resetAV = -20.0;
var angleV = -20.0, angleO = 0.0;
var fovy = 60;
var resetfov = 60.0;

function cameraScene() {
    aspect = gl.canvas.width / gl.canvas.height;
    perspectiveMatrix = utils.MakePerspective(fovy, aspect, 0.1, 100.0);
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
        //console.log("ENTITY");
        //console.log(entity);
        var eyePos = [cx,cy,cz];

        viewWorldMatrix = utils.multiplyMatrices(viewMatrix, entity.worldMatrix);
        projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
        gl.uniformMatrix4fv(entity.drawInfo.matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));

        gl.uniformMatrix4fv(entity.drawInfo.vertexMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(viewWorldMatrix));//Needs to be reviewed

        normalMatrix = utils.invertMatrix(utils.transposeMatrix(viewWorldMatrix));
        gl.uniformMatrix4fv(entity.drawInfo.normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));

        gl.uniform3fv(entity.drawInfo.eyePositionHandle,eyePos);

        lights.setLightValues(entity);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, entity.drawInfo.textureRef[0]);
        gl.uniform1i(entity.drawInfo.textLocation, 0);

        gl.bindVertexArray(entity.drawInfo.vertexArray);
        gl.drawElements(gl.TRIANGLES, entity.drawInfo.indices.length, gl.UNSIGNED_SHORT, 0);
    });

    window.requestAnimationFrame(cameraScene);
}

    function animate() {
        var currentTime = (new Date).getTime();
        if (lastUpdateTime) {
            var dt = (30 * (currentTime - lastUpdateTime)) / 1000.0;
        }

        entities.forEach(function (entity) {
            if (entity.drawInfo.name != "room" && entity.drawInfo.name != "pedestal") {
                entity.localMatrix = utils.multiplyMatrices(utils.MakeRotateYMatrix(dt), entity.localMatrix);
            }
        });
/*
        // Increment the coordinates to pan the camera to the desired location
        if (zoom && incr < deltaZoom) {
            // Reset moving variables
            speedX = 0.0;
            speedY = 0.0;
            keys = [];

            // Move camera and target
            cx += incrCamX;
            cy += incrCamY;
            cz += incrCamZ;
            target[0] += incrTargetX;
            target[1] += incrTargetY;
            target[2] += incrTargetZ;
            incr++;
        } else {
            // Look around animation while !inView
            if ((target[1] + speedY * 2.5 <= 85) && (target[1] + speedY * 2.5 >= -305)) {
                target[1] += speedY*2.5;
            }
            if ((target[0] + speedX * 2.5 >= -280) && (target[0] + speedX*2.5 <= 330)) {
                target[0] += speedX*2.5;
            }
        }
        // Look around animation while inView
        if (inView && incrViewY != 0) {
            if (viewingBoat <=2) {
                if (cy + incrViewY*2.5 >= -670 && cy+incrViewY*2.5 <=-360) {
                    cy+= incrViewY*2.5;
                }
            } else {
                if (cy+incrViewY*2.5 >= 190 && cy+incrViewY*2.5 <= 510) {
                    cy+= incrViewY*2.5;
                }
            }


        }*/
        lastUpdateTime = currentTime;
    }
