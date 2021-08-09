/*This file contains the info related to each object
  present in the rendered scene*/
  var entities= {};
  var Node = function() {
    this.children = [];
    this.localMatrix = utils.identityMatrix();
    this.worldMatrix = utils.identityMatrix();
  };
  Node.prototype.setParent = function(parent) {
     // remove us from our parent
     if (this.parent) {
       var ndx = this.parent.children.indexOf(this);
       if (ndx >= 0) {
         this.parent.children.splice(ndx, 1);
       }
     }
     // Add us to our new parent
     if (parent) {
       parent.children.append(this);
     }
     this.parent = parent;
   };
   //function updating the WorldMatrix when given a transformation matrix,also recursively cycles
  //through each child of the node
  Node.prototype.updateWorldMatrix = function(matrix) {
      if (matrix) {
          // a matrix was passed in so do the math
          this.worldMatrix = utils.multiplyMatrices(matrix, this.localMatrix);
      } else {
          // no matrix was passed in so just copy.
          utils.copy(this.localMatrix, this.worldMatrix);
      }

      // now process all the children
      var worldMatrix = this.worldMatrix;
      this.children.forEach(function(child) {
          child.updateWorldMatrix(worldMatrix);
      });
  };


  var nodes ={
    loadSceneAssets: async function(){
      //first we load up each obj into the array containing the usable assets
        infos.forEach(function(model_info) {
          console.log(model_info.id);
          assets[model_info.id] =ol.initObject(model_info);
          console.log("is assets a promise?"+assets[model_info.id]);
      });
      /*then we load up all the objects that we'll use in the scene
        please take note that we can have multiple objects referring
        to the SAME asset */
      entities["room"] = assets["room"];
      entities["pedestal"] = assets["pedestal"];
      entities["boat1"] /*= entities["boat2"] = entities["boat3"]= enitites["boat4"] */= assets["boat"];
      /*entities["xwing"] = assets["xwing"];
      entities["world"] = assets["world"];*/
  },
  sceneGraph: async function(){
    room = await retrieveAsset("room");
    //console.log(room);
    roomPositionNode = positionNodeBuilder(utils.MakeTranslateMatrix(-650,-715));
    roomNode = nodeBuilder(room/*assets["room"]*/, program, utils.multiplyMatrices(utils.MakeScaleMatrix(95.0), utils.MakeRotateXYZMatrix(270.0, 90.0, 0.0)));
    roomNode.setParent(roomPositionNode);

    pedestal = await retrieveAsset("pedestal");
    //console.log(pedestal);
    pedestalPositionNode = positionNodeBuilder(utils.MakeTranslateMatrix(-215.0, 0.0, -25.0));
    pedestalNode = nodeBuilder(pedestal,program,utils.MakeScaleMatrix(6.5));

    pedestalPositionNode.setParent(roomPositionNode);
    pedestalNode.setParent(pedestalPositionNode);

    boat = await retrieveAsset("boat");
    //console.log(boat);
    boatPositionNode= positionNodeBuilder(utils.MakeTranslateMatrix(0.0, 65.0, 0.0));
    boatNode = nodeBuilder(boat, program , utils.MakeScaleMatrix(0.25));
    boatPositionNode.setParent(pedestalPositionNode);
    boatNode.setParent(boatPositionNode);
  }
}
// The null values in drawInfo will be assigned in runtime.
function nodeBuilder( obj, program , localMatrix){
  node = new Node();
  node.localMatrix = localMatrix;
  console.log(obj);//at this point this object is still a promise
  node.drawInfo = {
      name:                       obj.info.id,
      programInfo:                program,
      // Locations
      positionAttributeLocation:  gl.getAttribLocation(program,"inPosition"),
      normalAttributeLocation:    gl.getAttribLocation(program, "inNormal"),
      uvLocation:                 gl.getAttribLocation(program, "a_uv"),
      matrixLocation:             gl.getUniformLocation(program, "matrix"),
      textLocation:               gl.getUniformLocation(program, "sampler"),
      normalMatrixPositionHandle: gl.getUniformLocation(program, 'nMatrix'),
      vertexMatrixPositionHandle: gl.getUniformLocation(program, 'pMatrix'),
      eyePositionHandle:          gl.getUniformLocation(program, 'eyePosition'),
      // Model info
      vertices:                   obj.objRef.vertices,
      normals:                    obj.objRef.vertexNormals,
      texCoord:                   obj.objRef.textures,
      indices:                    obj.objRef.indices,
      textureSrc:                 obj.info.tx_src,
      textureRef:                 loadTexture(baseDir+obj.info.tx_src),
      //Postponed here
      vertexArray:                null
  }
  node.drawInfo.vertexArray = ol.createObject(node.drawInfo);
  return node;
}
function positionNodeBuilder(localMatrix){
  positionNode = new Node();
  positionNode.localMatrix = localMatrix;
  return positionNode;
}
function retrieveAsset(name){
  console.log("I'm retrieving"+assets[name]);
  return assets[name];
}
