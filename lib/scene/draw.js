var draw = {
drawscene:function() {
	gl.viewport(0.0, 0.0, canw, canh);

	//WV Matrix update
	angle = angle + rvy;
	elevation = elevation + rvx;

	cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cy = lookRadius * Math.sin(utils.degToRad(-elevation));
	//Model Rotation Value
	modRot = document.getElementById("modRot").value;
	//Perspective
	perspectiveMatrix = utils.MakePerspective(60, canw/canh, 0.1, 1000.0);
	//View
	viewMatrix = utils.MakeView(cx, cy, cz, elevation, -angle);
	//World
	worldMatrix = utils.MakeWorld(0,0,0, modRot,0,0, worldScale);
  /*
  the slides go on to do:
  normalMatrix = utils.invertMatrix(utils.transposeMatrix(worldMatrix));

  projectionMatrix = utils.multiplyMatrices(viewMatrix, worldMatrix);<< This is the extra step
  projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, projectionMatrix);

  gl.uniformMatrix4fv(matrixLocation,gl.FALSE,utils.transposeMatrix(projectionMatrix));
  gl.uniformMatrix4fv(normalMatrixPositionHandle,gl.FALSE,utils.transposeMatrix(normalMatrix));
  */
  /*another excerpt from the slides:
    perspectiveMatrix = utils.MakePerspective(60, canw/canh, 0.1, 1000.0);
    viewMatrix = utils.MakeView(cx, cy, cz, elevation, -angle);
  */
	//VP Matrix
	projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewMatrix);

	// draws the request
	//Position buffer binding
	gl.bindBuffer(gl.ARRAY_BUFFER, worldMesh.vertexBuffer);
	/*Now we let the GLSL program know how to interpret our data:
			positionAttributeLocation : program.vertexPositionAttribute == where to find in memory our attribute
			size                      : worldMesh.vertexBuffer.itemSize == #values definining the vertex
			type                      : gl.FLOAT                        == the type of values
			normalize                 : false                           == Do not normalize data
			stride                    : 0                               == move_forward_size*sizeof()
			offset                    : 0                               == start at the beginning of the buffer
	*/
	gl.vertexAttribPointer(program.vertexPositionAttribute, worldMesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	//Texture buffer binding
	gl.bindBuffer(gl.ARRAY_BUFFER, worldMesh.textureBuffer);
  gl.vertexAttribPointer(program.textureCoordAttribute, worldMesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	//Normal buffer binding
	gl.bindBuffer(gl.ARRAY_BUFFER, worldMesh.normalBuffer);
	gl.vertexAttribPointer(program.vertexNormalAttribute, worldMesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	//Binds indices
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, worldMesh.indexBuffer);
	//
	gl.uniform1i(program.u_textureUniform, 0);
	gl.uniform3f(program.eyePosUniform, cx, cy, cz);

	WVPmatrix = utils.multiplyMatrices(projectionMatrix, worldMatrix);
	gl.uniformMatrix4fv(program.pMatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
	gl.uniformMatrix4fv(program.wMatrixUniform, gl.FALSE, utils.transposeMatrix(worldMatrix));

		for(var i = 0; i < unifParArray.length; i++) {
			unifParArray[i].type(gl);
		}
		gl.drawElements(gl.TRIANGLES, worldMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		window.requestAnimationFrame(drawScene);
},

scene:function() {
		//initial scene setup
		utils.resizeCanvasToDisplaySize(gl.canvas);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);

		var worldMatrix;
		var viewMatrix;
		var viewWorldMatrix;
		var projectionMatrix;
		var normalMatrix;
		var dirLightTransformed;
		var lightPosTransformed;
		for (let i = 0; i < 3; i++) {
				worldMatrix[i] = utils.MakeWorld(15.0 * (i - 1), 0.0, -5.0, 90.0,0.0,0.0, 0.01);
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
	},
	cameraScene: function(){
		//Placeholder light parameters -- START
	var dirLightAlpha = -utils.degToRad(60);
  var dirLightBeta  = -utils.degToRad(120);

  var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
              Math.sin(dirLightAlpha),
              Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
              ];
  var directionalLightColor = [0.1, 1.0, 1.0];
  var cubeMaterialColor = [0.5, 0.5, 0.5];

	var materialDiffColorHandle = gl.getUniformLocation(program, 'mDiffColor');
  var lightDirectionHandle = gl.getUniformLocation(program, 'lightDirection');
  var lightColorHandle = gl.getUniformLocation(program, 'lightColor');
		//END
	console.log("roomPositionNode:"+ roomPositionNode);
	roomPositionNode.updateWorldMatrix();
	var aspect = gl.canvas.width / gl.canvas.height;
	var perspectiveMatrix = utils.MakePerspective(90, aspect, 0.1, 100.0);
	var viewMatrix = utils.MakeView(3.0,3.0,2.5,-45.0,-40.0);

	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);

	entities.forEach(function(entity){
		gl.useProgram(entity.drawInfo.programInfo);

		var viewWorldMatrix = utils.multiplyMatrices(viewMatrix,entity.worldMatrix);
		var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);

		var normalMatrix = utils.invertMatrix(utils.transposeMatrix(viewWorldMatrix));
		gl.uniformMatrix4fv(entity.drawInfo.normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));
		gl.uniformMatrix4fv(entity.drawInfo.matrixLocation,gl.FALSE, utils.transposeMatrix(projectionMatrix));

		var dirLightTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4(viewMatrix), directionalLight);

		gl.uniform3fv(lightDirectionHandle,  dirLightTransformed);
		gl.uniform3fv(materialDiffColorHandle, cubeMaterialColor);
		gl.uniform3fv(lightColorHandle,  directionalLightColor);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D,entity.drawInfo.textureRef[0]);
		gl.uniform1i(entity.drawInfo.textLocation,0);
		gl.bindVertexArray(entity.drawInfo.vertexArray);
		gl.drawElements(gl.TRIANGLES, entity.drawInfo.indices.length,gl.UNSIGNED_SHORT,0);
		});
	}
}
