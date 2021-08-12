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
        //console.log("is objEnt a promise ?"+ objEnt);
        //return objEnt;
    },

    createVAO: function (drawInfo) {
        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        var positionBuffer = gl.createBuffer();
				createAttribArray(gl, positionBuffer, drawInfo.vertices, drawInfo.positionAttributeLocation, 3);
        /*gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(drawInfo.vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(drawInfo.positionAttributeLocation);
        gl.vertexAttribPointer(drawInfo.positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);*/

        var normalBuffer = gl.createBuffer();
				createAttribArray(gl,normalBuffer, drawInfo.normals, drawInfo.normalAttributeLocation,3);
        /*gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(drawInfo.normals), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(drawInfo.normalAttributeLocation);
        gl.vertexAttribPointer(drawInfo.normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);*/

        var uvBuffer = gl.createBuffer();
				createAttribArray(gl,uvBuffer, drawInfo.texCoord, drawInfo.uvLocation,2);
        /*gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(drawInfo.texCoord), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(drawInfo.uvLocation);
        gl.vertexAttribPointer(drawInfo.uvLocation, 2, gl.FLOAT, false, 0, 0);*/

        var indexBuffer = gl.createBuffer();
				createIndexArray(gl, indexBuffer, drawInfo.indices);
        /*gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(drawInfo.indices), gl.STATIC_DRAW);*/

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
