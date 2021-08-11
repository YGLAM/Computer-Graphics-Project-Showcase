/*This file contains the info related to each object
  present in the rendered scene*/

/*var roomPositionNode;
var roomNode;
// Pedestals
var pedestalPositionNode;
var pedestalNode;
// Boats
var boatPositionNode;
var boatNode;
*/
var Node = function () {
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
        /*then we load up all the objects that we'll use in the scene
          please take note that we can have multiple objects referring
          to the SAME asset */
        /*entities["room"] = assets["room"];
        entities["pedestal"] = assets["pedestal"];
        entities["boat1"] /*= entities["boat2"] = entities["boat3"]= enitites["boat4"] *//*= assets["boat"];*/
        /*entities["xwing"] = assets["xwing"];
        entities["world"] = assets["world"];*/
    },

    // Create nodes of all the entities and define their attributes for the render: shader locations,
    // objmodel info and textures (textures are loaded directly when the entity is created)
    sceneGraph: async function () {
        room = await retrieveAsset("room");
        //console.log("is room async?" + room);
        roomPositionNode = positionNodeBuilder(utils.identityMatrix());
        //console.log("is my program empty"+program);
        roomNode = nodeBuilder(room/*assets["room"]*/, program, utils.MakeScaleMatrix(10.0));
        nodeLocationInfo(roomNode);
        nodeModelInfo(room);
        nodeTextureInfo(roomNode);
        //console.log(roomNode.drawInfo.programInfo);
        roomNode.setParent(roomPositionNode);

        pedestal = await retrieveAsset("pedestal");
        //console.log(pedestal);
        pedestalPositionNode = positionNodeBuilder(utils.MakeTranslateMatrix(0.0, 5.0, 0.0));
        pedestalNode = nodeBuilder(pedestal, program, utils.MakeScaleMatrix(0.5));
        nodeLocationInfo(pedestalNode);
        nodeModelInfo(pedestal);
        nodeTextureInfo(pedestalNode);
        pedestalPositionNode.setParent(roomPositionNode);
        pedestalNode.setParent(pedestalPositionNode);

        boat = await retrieveAsset("boat");
        //console.log(boat);
        boatPositionNode= positionNodeBuilder(utils.MakeTranslateMatrix(0.0, 5.0, 0.0));
        boatNode = nodeBuilder(boat, program , utils.MakeScaleMatrix(0.01));
        nodeLocationInfo(boatNode);
        nodeModelInfo(boat);
        nodeTextureInfo(boatNode);
        boatPositionNode.setParent(pedestalPositionNode);
        boatNode.setParent(boatPositionNode);


        entities = [
            roomNode,
            pedestalNode,
            boatNode
        ];
    }
}

// The null values in drawInfo will be assigned in runtime. (?)
function nodeBuilder(obj, program, localMatrix) {
    node = new Node();
    utils.copy(localMatrix, node.localMatrix);
    //console.log(obj);//at this point this object is still a promise
    node.drawInfo = {
        name: /*"boat"*/obj.info.id,
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
        eyePositionHandle: null/*gl.getUniformLocation(program, 'eyePosition')*/,/*maybe used for the look at matrix*/
        // Model info
        vertices: null,
        normals: null,
        texCoord: null,
        indices: null,
        lightLocation: new lightLocation(),
        textureSrc: /*"assets/boat/boat_diffuse.bmp"*/obj.info.tx_src,
        textureRef: []/*loadTexture(baseDir+obj.info.tx_src)*/,
        //Postponed here

    }
    console.log(node);
    return node;
}

function nodeLocationInfo(node) {
    gl.useProgram(node.drawInfo.program);
    node.drawInfo.positionAttributeLocation = gl.getAttribLocation(program, "in_position");
    node.drawInfo.normalAttributeLocation = gl.getAttribLocation(program, "in_normal");
    node.drawInfo.uvLocation = gl.getAttribLocation(program, "in_uv");
    node.drawInfo.matrixLocation = gl.getUniformLocation(program, "matrix");
    node.drawInfo.textLocation = gl.getUniformLocation(program, "u_texture");
    node.drawInfo.normalMatrixPositionHandle = gl.getUniformLocation(program, 'nMatrix');
    node.drawInfo.vertexMatrixPositionHandle = gl.getUniformLocation(program, 'pMatrix');
}

function nodeModelInfo(obj) {
    node.drawInfo.vertices = obj.objRef.vertices;
    node.drawInfo.indices = obj.objRef.indices;
    node.drawInfo.normals = obj.objRef.vertexNormals;
    node.drawInfo.texCoord = obj.objRef.textures;
    // node.drawInfo.vertices = assets[node.drawInfo.name].vertices;
    // node.drawInfo.indices = assets[node.drawInfo.name].indices;
    // node.drawInfo.normals = assets[node.drawInfo.name].vertexNormals;
    // node.drawInfo.texCoord = assets[node.drawInfo.name].textures;
}

function nodeTextureInfo(node) {
    node.drawInfo.vertexArray = ol.createVAO(node.drawInfo);
    tl.loadTextures(baseDir + node.drawInfo.textureSrc, node);
    // var textureImage = new Image();
    //     textureImage.src = baseDir + "assets/boat/boat_diffuse_png.png";
    //     textureImage.onload = function() {
    //         var texture = gl.createTexture();
    //         //gl.activeTexture(gl.TEXTURE0);
    //         gl.bindTexture(gl.TEXTURE_2D, texture);

    //         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
    //         gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //         gl.generateMipmap(gl.TEXTURE_2D);
    //         // Add texture to the node
    //         node.drawInfo.textureRef.push(texture);
    //     };
}

function positionNodeBuilder(localMatrix) {
    positionNode = new Node();
    utils.copy(localMatrix, positionNode.localMatrix);
    return positionNode;
}

function retrieveAsset(name) {
    //console.log("I'm retrieving"+assets[name]);
    return assets[name];
}