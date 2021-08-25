/*This file contains the info related to each object
  present in the rendered scene*/
var entities = [];
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
        infos.forEach(function (model_info) {
            assets[model_info.id] = ol.initObject(model_info);
        });
    },

    // Create nodes of all the entities and define their attributes for the render: shader locations,
    // objmodel info and textures (textures are loaded directly when the entity is created)
    buildSceneGraph: async function () {
        //Room
        roomPositionNode = await createNode("room", 0, utils.identityMatrix(), utils.MakeScaleMatrix(10.0));
        //
        for  (const position of positionsInfo) {
          if (position.requiresPed){
            console.log(position.id + " "+ position.name);
            var pedPos = utils.MakeTranslateMatrix(position.pedPos[0],position.pedPos[1],position.pedPos[2]);
            var pedScale = utils.MakeScaleMatrix(position.pedScale);
            var modelPos = utils.MakeTranslateMatrix(position.modelPos[0],position.modelPos[1],position.modelPos[2]);
            var modelScale = utils.MakeScaleMatrix(position.modelScale);
            await createModelAndPedestal(position.id,position.name,
                                        pedPos,pedScale,
                                        modelPos,modelScale);
            //If we do not await and save the nodes in the correct order the scene graph will not work properly

          }
        }
    },

}
async function changeNode(node,desired){
      let indx = entities.indexOf(node);
      console.log(indx);
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
      tl.loadTextures(baseDir + temp.drawInfo.textureSrc, temp);
      lights.lightLocations(temp);

      node.drawInfo = temp.drawInfo;
      console.log('All done!');
      loadNodeInfo(node,asset);
      console.log(entities);
      console.log(node);
      entities[indx]= node;

}
async function createNode(name, id, localPosition, scale) {
    positionNode = positionNodeBuilder(localPosition);
    //see https://bluepnume.medium.com/learn-about-promises-before-you-start-using-async-await-eb148164a9c8#.w234uo7h3
    //@ Pitfall 2: awaiting multiple values
    var nodeProgram;
    var asset;
    [asset, nodeProgram] = await Promise.all([retrieveAsset(name), createNodeProgram(nodeProgram)]);
    node = await nodeBuilder(asset, nodeProgram, scale);
    entities.push(node);

    node.id = positionNode.id = id;
    //I load the objEntity into the node
    loadNodeInfo(node, asset);
    //I pair the node with its positionNode
    node.setParent(positionNode);

    //I push the node to the entities table
    console.log("I've pushed " + node.id + " to " + entities+" at "+entities.indexOf(node));
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
    await utils.loadFiles([shaderDir + '/vertices/vs.glsl', shaderDir + 'fragments/fs_two.glsl'],
        function (shaderText) {
            var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
            console.log("vs: " + vertexShader);
            var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
            console.log("fs: " + fragmentShader);
            nodeProgram = utils.createProgram(gl, vertexShader, fragmentShader);
            console.log("program: " + nodeProgram);
        });
    return nodeProgram;
}
// The null values in drawInfo will be assigned in runtime.
function nodeBuilder(obj, program, localMatrix) {

    node = new Node();
    utils.copy(localMatrix, node.localMatrix);
    node.drawInfo = {
        name: obj.info.id,
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
        textureSrc: obj.info.tx_src,
        textureRef: [],
    }
    return node;
}
function loadNodeInfo(node, obj) {
    var prg = node.drawInfo.programInfo;
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
    tl.loadTextures(baseDir + node.drawInfo.textureSrc, node);
}
function positionNodeBuilder(localMatrix) {
    positionNode = new Node();
    utils.copy(localMatrix, positionNode.localMatrix);
    return positionNode;
}
function retrieveAsset(name) {
    return assets[name];
}
