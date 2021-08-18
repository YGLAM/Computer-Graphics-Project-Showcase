var zoom = false;
//maybe we need to move or parametrize these ones..
var cx = 0.0, cy = 20.0, cz = 35.0;
var angleV = -20.0, angleO = 0.0;

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
            if (entity.drawInfo.name == "boat") {
                entity.localMatrix = utils.multiplyMatrices(utils.MakeRotateYMatrix(dt), entity.localMatrix);
            }
        });

        lastUpdateTime = currentTime;
    }
