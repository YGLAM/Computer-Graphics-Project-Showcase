//this array contains every single obj entity used in the project
var assets={};
/*An objEntity contains:
    -objRef : the OBJ.Mesh obtained from the path contained in the obj's info object
    -m_info : the Model_Info object that contains the path for both the OBJ and Texture paths*/
function objEntity(objRef,m_info) {
	this.objRef = objRef;//The corresponding uniform name in the GLSL program
  this.info = m_info;
}
var ol={
  initObject: async function(m_info){
        var objStr = await utils.get_objstr(m_info.src);
        objModel = new OBJ.Mesh(objStr);
        return new objEntity(objModel,m_info);
  },
  createObject:function(obj){
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    var positionBuffer = gl.createBuffer();
    createAttribArray(gl,positionBuffer,obj.vertices/*modelVertices*/,positionAttributeLocation,3);

    var normalBuffer = gl.createBuffer();
    createAttribArray(gl,normalBuffer,obj.vertexNormals/*modelNormals*/,normalAttributeLocation,3);

    var uvBuffer = gl.createBuffer();
    createAttribArray(gl,uvBuffer,obj.textures/*modelTexCoords*/,uvAttributeLocation,2);

    var indexBuffer = gl.createBuffer();
    createIndex(gl,indexBuffer,obj.indices/*modelIndices*/);

    var texture = gl.createTexture();
    createTexture(gl,texture);
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
