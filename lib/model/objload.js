//this array contains every single obj entity used in the project
var assets = {};
/*An objEntity contains:
    -objRef : the OBJ.Mesh obtained from the path contained in the obj's info object
    -m_info : the Model_Info object that contains the path for both the OBJ and Texture paths*/
class objEntity {
    constructor(objRef, m_info) {
        this.objRef = objRef; //The corresponding uniform name in the GLSL program
        this.info = m_info;
    }
}

var ol = {
    initObject: async function (m_info) {
        //console.log("is m_info a promise ?"+ m_info);//spoiler: it is not
        var objStr = await utils.get_objstr(m_info.src);
        var objModel = new OBJ.Mesh(objStr);
        return new objEntity(objModel, m_info);

    },
    createVAO: function (drawInfo) {
        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        var positionBuffer = gl.createBuffer();
				createAttribArray(gl, positionBuffer, drawInfo.vertices, drawInfo.positionAttributeLocation, 3);

        var normalBuffer = gl.createBuffer();
				createAttribArray(gl,normalBuffer, drawInfo.normals, drawInfo.normalAttributeLocation,3);

        var uvBuffer = gl.createBuffer();
				createAttribArray(gl,uvBuffer, drawInfo.texCoord, drawInfo.uvLocation,2);

        var indexBuffer = gl.createBuffer();
        createIndexArray(gl, indexBuffer, drawInfo.indices);

        console.log(vao);
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
