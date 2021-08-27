var zoom = false;
var cx = 0.0, cy = 24.0, cz = 45.0;
var fovy = 60;
var target = [0.0,12.0,0.0];
var deltaCx =0;deltaCy=0;deltaCz=0;
var speedX=0; speedY=0;
var init= true;

function cameraScene() {
    aspect = gl.canvas.width / gl.canvas.height;
    perspectiveMatrix = utils.MakePerspective(fovy, aspect, 0.1, 100.0);

    // Compute the camera matrix using look at function.
    var up = [0.0, 1.0, 0.0];
    //makeLookAt inverts the camera matrix all in the utils function
    viewMatrix = utils.MakeLookAt([cx, cy, cz], target, up);
    //old viewMatrix
    //viewMatrix = utils.MakeView(cx,cy,cz,angleV,angleO);
    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    animate();
    roomPositionNode.updateWorldMatrix();

    prepareDraw();

    window.requestAnimationFrame(cameraScene);
}

function prepareDraw(){
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
        // Increment the coordinates to pan the camera to the desired location
        if ( !zoom){
            //moves the camera target
            target[1] = movementDelta(target[1], speedY, 0.8, -5 ,24);
            target[0] = movementDelta(target[0], speedX, 0.85,-15.3,16.15);
            //moves the camera
            cx = movementDelta(cx, deltaCx, 1.0,-13,13);
            cy = movementDelta(cy, deltaCy, 1.0,17,40);
            cz = movementDelta(cz,deltaCz, 1.0,20,45);
        }
        //I'm not interested in look around functions while zoomed in
        lastUpdateTime = currentTime;
    }
function movementDelta( recipient , delta ,speed, low_bound, high_bound){
  if ((recipient+ delta*speed <= high_bound) && (recipient+ delta*speed >= low_bound)){
    recipient += delta*speed;
  }
  return recipient
}
