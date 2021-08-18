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
            //console.log(model_info.id);
            assets[model_info.id] = ol.initObject(model_info);
            //console.log("is assets a promise?"+assets[model_info.id]);
        });
    },

    // Create nodes of all the entities and define their attributes for the render: shader locations,
    // objmodel info and textures (textures are loaded directly when the entity is created)
    buildSceneGraph: async function () {
        async function createNode(name, id, localPosition, scale) {
            asset = await retrieveAsset(name);
            positionNode = positionNodeBuilder(localPosition);

            // Creation of the program
            var nodeProgram;
            nodeProgram = await createNodeProgram(nodeProgram);

            node = await nodeBuilder(asset, nodeProgram, scale);
            node.id = positionNode.id = id;
            //I load the objEntity into the node
            loadNodeInfo(node, asset);
            //I pair the node with its positionNode
            node.setParent(positionNode);

            //I push the node to the entities table
            entities.push(node);
            //console.log("I've pushed " + node + " to " + entities);
            return positionNode;
        }
        async function createBoatAndPedestal(id, pedestalPosition, pedestalScale, boatPosition, boatScale) {
            pedestalPositionNode = await createNode("pedestal", 0, pedestalPosition, pedestalScale);
            boatPositionNode = await createNode("world", id, boatPosition, boatScale);
            //this fixes the pedestal position node to the room's position node
            pedestalPositionNode.setParent(roomPositionNode);
            //this fixes the boat to the pedestal)
            boatPositionNode.setParent(pedestalPositionNode);
        }
        //helper variables
        var pedPos;
        var pedScale;
        var boatPos;
        var boatScale;
        //Room
        roomPositionNode = await createNode("room", 0, utils.identityMatrix(), utils.MakeScaleMatrix(10.0));

        //Pedestal and Boat One
        pedPos = utils.MakeTranslateMatrix(-20.0, 5.0, 0.0);
        pedScale = utils.MakeScaleMatrix(0.5);
        boatPos = utils.MakeTranslateMatrix(0.0, 5.0, 0.0);;
        boatScale = utils.MakeScaleMatrix(1);
        await createBoatAndPedestal(1, pedPos, pedScale, boatPos, boatScale);

        //Pedestal and Boat Two
        pedPos = utils.MakeTranslateMatrix(0.0, 5.0, 0.0);
        pedScale = utils.MakeScaleMatrix(0.5);
        boatPos = utils.MakeTranslateMatrix(0.0, 5.0, 0.0);
        boatScale = utils.MakeScaleMatrix(1);
        await createBoatAndPedestal(2, pedPos, pedScale, boatPos, boatScale);

        //Pedestal and Boat Three
        pedPos = utils.MakeTranslateMatrix(20.0, 5.0, 0.0);
        pedScale = utils.MakeScaleMatrix(0.5);
        boatPos = utils.MakeTranslateMatrix(0.0, 5.0, 0.0);
        boatScale = utils.MakeScaleMatrix(1);
        await createBoatAndPedestal(3, pedPos, pedScale, boatPos, boatScale);
    }
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
    ;
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
