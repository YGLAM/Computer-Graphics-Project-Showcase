/*This file contains the info related to each object
  present in the rendered scene*/
var entities = [];
var infos =[];

var roomPositionNode;
var Node = function () {
    this.id = 0;
    this.children = [];
    this.localMatrix = utils.identityMatrix();
    this.worldMatrix = utils.identityMatrix();
};

Node.prototype.setParent = function (parent) {
    // remove us from our parent
    if (this.parent) {
        var ndx = this.parent.children.indexOf(this);
        if (ndx >= 0) {
            this.parent.children.splice(ndx, 1);
        }
    }
    // Add us to our new parent
    if (parent) {
        parent.children.push(this);
    }
    this.parent = parent;
};

//function updating the WorldMatrix when given a transformation matrix,also recursively cycles
//through each child of the node
Node.prototype.updateWorldMatrix = function (matrix) {
    if (matrix) {
        // a matrix was passed in so do the math
        this.worldMatrix = utils.multiplyMatrices(matrix, this.localMatrix);
    } else {
        // no matrix was passed in so just copy.
        utils.copy(this.localMatrix, this.worldMatrix);
        //this.worldMatrix = utils.identityMatrix();
    }
    // now process all the children
    var worldMatrix = this.worldMatrix;
    this.children.forEach(function (child) {
        child.updateWorldMatrix(worldMatrix);
    });
};

var nodes = {
    // Load assets with objMesh and other infos
    loadSceneAssets: async function () {
        //first we load up each obj into the array containing the usable assets
        for ( const info of infos){
          assets[info.id] = await ol.initObject(info);
        }
    },

    // Create nodes of all the entities and define their attributes for the render: shader locations,
    // objmodel info and textures (textures are loaded directly when the entity is created)
    buildSceneGraph: async function () {
        //Room
        roomPositionNode = await createNode("room", 0, utils.identityMatrix(), utils.MakeScaleMatrix(10.0));
        for  (const position of positionsInfo) {
          if (position.requiresPed){

            let pedPos = utils.MakeTranslateMatrix(position.pedPos[0],position.pedPos[1],position.pedPos[2]);
            let pedScale = utils.MakeScaleMatrix(position.pedScale);
            let modelPos = utils.MakeTranslateMatrix(position.modelPos[0],position.modelPos[1],position.modelPos[2]);
            let scale = retrieveScale(position.name);
            let modelScale = utils.MakeScaleMatrix(retrieveScale(position.name));

            await createModelAndPedestal(position.id,position.name,
                                        pedPos,pedScale,
                                        modelPos,modelScale);
            //If we do not await and save the nodes in the correct order the scene graph will not work properly
          }
        }
    }

}
async function changeNode(node,desired){
      let indx = entities.indexOf(node);
      let asset = await retrieveAsset(desired);
      let temp = new Node();
      temp.drawInfo = {
          name: asset.info.id,
          programInfo: node.drawInfo.programInfo,
          // Locations
          positionAttributeLocation: node.drawInfo.positionAttributeLocation,
          normalAttributeLocation: node.drawInfo.normalAttributeLocation,
          uvLocation: node.drawInfo.uvLocation,
          matrixLocation: node.drawInfo.matrixLocation,
          textLocation: node.drawInfo.textLocation,
          normalMatrixPositionHandle: node.drawInfo.normalMatrixPositionHandle,
          vertexMatrixPositionHandle: node.drawInfo.vertexMatrixPositionHandle,
          vertexArray: null,
          eyePositionHandle: node.drawInfo.eyePositionHandle,
          // Model info
          vertices : asset.objRef.vertices,
          indices : asset.objRef.indices,
          normals : asset.objRef.vertexNormals,
          texCoord : asset.objRef.textures,
          lightLocation: new lightLocation(),
          textureSrc: asset.info.tx_src,
          textureRef: [],
        }
      temp.drawInfo.vertexArray = ol.createVAO(temp.drawInfo);
      tl.loadSyncTextures(baseDir + temp.drawInfo.textureSrc, temp);
      lights.lightLocations(temp);

      node.localMatrix = utils.MakeScaleMatrix(retrieveScale(temp.drawInfo.name));
      roomPositionNode.updateWorldMatrix();

      node.drawInfo = temp.drawInfo;
      entities[indx]= node;

}
async function createNode(name, id, localPosition, scale) {
    positionNode = positionNodeBuilder(localPosition);

    let nodeProgram;
    nodeProgram = await createNodeProgram(nodeProgram);
    node = await nodeBuilder(retrieveInfo(name), nodeProgram, scale);
    entities.push(node);

    node.id = positionNode.id = id;
    //I load the objEntity into the node
    loadNodeInfo(node, retrieveAsset(node.drawInfo.name));
    //I pair the node with its positionNode
    node.setParent(positionNode);
    //I push the node to the entities table
    return positionNode;
}
async function createModelAndPedestal(id,model_name, pedestalPosition, pedestalScale, boatPosition, boatScale) {
    pedestalPositionNode =await createNode("pedestal", 0, pedestalPosition, pedestalScale);
    modelPositionNode = await  createNode(model_name, id, boatPosition, boatScale);
    //this fixes the pedestal position node to the room's position node
    pedestalPositionNode.setParent(roomPositionNode);
    //this fixes the boat to the pedestal)
    modelPositionNode.setParent(pedestalPositionNode);
}
async function createNodeProgram(nodeProgram) {
    await utils.loadFiles([shaderDir + '/vertices/vs.glsl', shaderDir + 'fragments/fs.glsl'],
        function (shaderText) {
            var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
            //console.log("vs: " + vertexShader);
            var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
            //console.log("fs: " + fragmentShader);
            nodeProgram = utils.createProgram(gl, vertexShader, fragmentShader);
            //console.log("program: " + nodeProgram);
        });
    return nodeProgram;
}
// The null values in drawInfo will be assigned in runtime.
async function nodeBuilder(info, program, localMatrix) {

    node = new Node();
    utils.copy(localMatrix, node.localMatrix);
    node.drawInfo = {
        name: info.id,
        programInfo: program,
        // Locations
        positionAttributeLocation: null,
        normalAttributeLocation: null,
        uvLocation: null,
        matrixLocation: null,
        textLocation: null,
        normalMatrixPositionHandle: null,
        vertexMatrixPositionHandle: null,
        vertexArray: null,
        eyePositionHandle: null,
        // Model info
        vertices: null,
        normals: null,
        texCoord: null,
        indices: null,
        lightLocation: new lightLocation(),
        textureSrc: info.tx_src,
        textureRef: [],
    }
    return node;
}
function loadNodeInfo(node, obj) {
    let prg = node.drawInfo.programInfo;
    gl.useProgram(prg);

    //Location Info
    node.drawInfo.positionAttributeLocation = gl.getAttribLocation(prg, "in_position");
    node.drawInfo.normalAttributeLocation = gl.getAttribLocation(prg, "in_normal");
    node.drawInfo.uvLocation = gl.getAttribLocation(prg, "in_uv");
    node.drawInfo.matrixLocation = gl.getUniformLocation(prg, "matrix");
    node.drawInfo.textLocation = gl.getUniformLocation(prg, "u_texture");
    node.drawInfo.normalMatrixPositionHandle = gl.getUniformLocation(prg, 'nMatrix');
    node.drawInfo.vertexMatrixPositionHandle = gl.getUniformLocation(prg, 'pMatrix');
    node.drawInfo.eyePositionHandle = gl.getUniformLocation(prg, "eyePosition");
    //ModelInfo
    node.drawInfo.vertices = obj.objRef.vertices;
    node.drawInfo.indices = obj.objRef.indices;
    node.drawInfo.normals = obj.objRef.vertexNormals;
    node.drawInfo.texCoord = obj.objRef.textures;
    node.drawInfo.vertexArray = ol.createVAO(node.drawInfo);
    //Texture
    tl.loadSyncTextures(baseDir + node.drawInfo.textureSrc, node);
    return node;
}
function positionNodeBuilder(localMatrix) {
    positionNode = new Node();
    utils.copy(localMatrix, positionNode.localMatrix);
    return positionNode;
}

function retrieveAsset(name) {
    return assets[name];
}
function retrieveScale(entity){
  let result;
  infos.forEach(function(info){
    if(info.id == entity){
      //console.log("the scale of "+ entity + "||| "+ info.id);
      //console.log(info.scale);
      result = info.scale;
    }
  });
  return result;
}
function retrieveInfo(name){
  let result;
  infos.forEach(function(info){
    if( info.id == name){      result = info;    }
  });
  return result;
}
