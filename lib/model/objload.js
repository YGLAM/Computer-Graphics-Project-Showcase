//this array contains every single obj entity used in the project
var assets = [];
//var objModel;

/*An objEntity contains:
    -objRef : the OBJ.Mesh obtained from the path contained in the obj's info object
    -m_info : the Model_Info object that contains the path for both the OBJ and Texture paths*/
class objEntity {
    constructor(objRef, m_info) {
        this.objRef = objRef;
        this.info = m_info;
    }
}

var ol = {
    initObject: async function (m_info) {
        var objStr = await utils.get_objstr(m_info.src);
        var objModel =  new OBJ.Mesh(objStr);
        return new objEntity(objModel, m_info);

    },
    createVAO: function (drawInfo) {//Sets up the vertex array object of a given node entity
        let vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        let positionBuffer = gl.createBuffer();
				createAttribArray(gl, positionBuffer, drawInfo.vertices, drawInfo.positionAttributeLocation, 3);

        let normalBuffer = gl.createBuffer();
				createAttribArray(gl,normalBuffer, drawInfo.normals, drawInfo.normalAttributeLocation,3);

        let uvBuffer = gl.createBuffer();
				createAttribArray(gl,uvBuffer, drawInfo.texCoord, drawInfo.uvLocation,2);

        let indexBuffer = gl.createBuffer();
        createIndexArray(gl, indexBuffer, drawInfo.indices);
        return vao;
    }
}

 function createAttribArray(gl, buff, data, location, size) {
     gl.bindBuffer(gl.ARRAY_BUFFER, buff);
     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
     gl.enableVertexAttribArray(location);
     gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
 }
 function createIndexArray(gl, buff, data) {
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buff);
     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
 }
