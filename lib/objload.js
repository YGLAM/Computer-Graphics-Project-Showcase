function objEntity(id,objRef) {
	this.id = id;
	this.objRef = objRef;//The corresponding uniform name in the GLSL program
}
var objload={
  initObject: function(name){
        var objStr = await utils.get_objstr(name);
        objModel = new OBJ.Mesh(objStr);
        /*modelVertices = objModel.vertices; //Array of vertices
        modelNormals = objModel.vertexNormals; //Array of normals
        modelIndices = objModel.indices; //Array of indices
        modelTexCoords = objModel.textures; //Array of uv coordinates*/
        return objModel;
  },
  createObject:function(gl,obj){
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    var positionBuffer = gl.createBuffer();
    utils.createAttribArray(gl,positionBuffer,obj.vertices/*modelVertices*/,positionAttributeLocation,3);

    var normalBuffer = gl.createBuffer();
    utils.createAttribArray(gl,normalBuffer,obj.vertexNormals/*modelNormals*/,normalAttributeLocation,3);

    var uvBuffer = gl.createBuffer();
    utils.createAttribArray(gl,uvBuffer,obj.textures/*modelTexCoords*/,uvAttributeLocation,2);

    var indexBuffer = gl.createBuffer();
    utils.createIndex(gl,indexBuffer,obj.indices/*modelIndices*/);

    var texture = gl.createTexture();
    utils.createTexture(gl,texture);
  },
  createAttribArray:function(gl,buff,data,location,size){
    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  },
  createIndex:function(gl,buff,data){
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buff);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
  },
  createTexture:function(gl,tx){
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tx);
  }
}
