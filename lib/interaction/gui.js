var activeID = 0;
//Arrays containing the different valid values of the selection GUI
var generalSelection = [//substring: 0
    "type",
    "ambient",
    "diffuse",
    "specular"
];
var typeSelection = [//substring: 4
    "typedirect",
    "typepoint",
    "typespot",
    "typenone"
];
var ambientSelection = [//substring: 7
    "ambientambient",
    "ambienthemispheric",
    "ambientnone"
];
var diffuseSelection = [//substring: 7
    "diffuselambert",
    "diffusetoon",
    "diffuseoren",
    "diffusenone"
];
var specularSelection = [//substring:8
    "specularphong",
    "specularblinn",
    "speculartoonPhong",
    "speculartoonBlinn",
    "specularnone"
];
//Key buffer storing inputs
var keyBuffer=[];

//Returns to the original camera position and orientation
function reset(){
  cx = 0.0; cy = 24.0; cz = 45.0 ;
  target =[0.0,12.0,0.0];
  speedX = 0;speedY = 0;
  deltaCx= 0; deltaCy= 0; deltaCz = 0;
  up = [0.0,1.0,0.0];
  zoom = false;
  showMenu("none");
}

//Switches the view to the model with the requested "id"
//With id = 0 it sets up the view to show the room lighting parameters
function switchView(id,zoomStatus,displayStatus ){
  if ( id != 0 ){//If I'm switching to any model
    let tempTarget = retrieveWorldPosition(retrieveEntitywID(id));
    let tempPos=[tempTarget[0],tempTarget[1]+3,18];
    cx = tempPos[0]; cy = tempPos[1]; cz = tempPos[2];
    target = tempTarget;
  }else{//I must switch to the room menu but I don't have to show the dropdown that allows to change the currently active model
    document.getElementById("modelSelection").style.display = "none";
    document.getElementById("model").innerText = "Room Lighting";
  }
  activeID = id;
  updateGUI();
  zoom = zoomStatus;
  showMenu(displayStatus);

}

//Invoked when pushing down the button,it buffers in each input
function keyFunctionDown(e) {
    // When not zooming in the model we can freely look and move around
    // the room
    if (!zoom) {
        if (!(keyBuffer.includes(e.keyCode))) {
            keyBuffer.push(e.keyCode);
            switch(e.keyCode) {
              //camera rotation
              case 72:speedX-= 1;break; // sx - H
              case 75:speedX+= 1;break; // dx - K
              case 85:speedY+= 1;break; // up - U
              case 74:speedY-= 1;break; // down - J
              //camera position
              case 87: deltaCy+=1;break;//W = y+
              case 83: deltaCy-=1;break;//S = y-
              case 65: deltaCx-=1;break;//A = x-
              case 68: deltaCx+=1;break;//D = x+

              case 90: deltaCz-=1;break;//Z = z-
              case 88: deltaCz+=1;break;//X = z+
            }
        }
    }
}
//Invoked when releasing the button
//Cancels out the speedX,Y and deltaCx,y,z variables that define if the camera is moving/rotating
//along the specific axis
function keyFunction(e) {
    // If the view is not zoomed on a boat, I can zoom on a boat
    if (!zoom) {
      if (keyBuffer.includes(e.keyCode)) {
          for( var i = 0; i < keyBuffer.length; i++){
              if ( keyBuffer[i] === e.keyCode) {
                  keyBuffer.splice(i, 1);
              }
          }
          // Set viewMatrix to zoom on a certain boat and set zoom to true
          switch (e.keyCode) {
              case 49:    // left
                  switchView(1,true,"block");
                  break;
              case 50:    // center
                  switchView(2,true,"block");
                  break;
              case 51:    // right
                  switchView(3,true,"block");
                  break;
              case 48:// inspect room ligthing
                  switchView(0,true,"block");
                  break;
              //camera position delta reset
              case 87: deltaCy-=1;break; //W = y+
              case 83: deltaCy+=1;break; //S = y-

              case 65: deltaCx+=1;break; //A = x-
              case 68: deltaCx-=1;break; //D = x+

              case 90: deltaCz+=1;break; //Z = z-
              case 88: deltaCz-=1;break; //X = x+
              //camera target delta reset
              case 72: speedX+= 1;break; // H - sx
              case 75: speedX-= 1;break; // K - dx
              case 85: speedY-= 1;break; // U - up
              case 74: speedY+= 1;break; // J - down
              case 66: positionLog();break;//B
              case 82: reset();break;// R
          }
      }
    }else{// If the view is on a model, I can only press "esc" to reset it or press the numpad
          // to see the different models
        switch (e.keyCode) {
            case 27:    // Escape
                reset();
                break;
                case 49:    // left
                    switchView(1,true,"block");
                    break;
                case 50:    // center
                    switchView(2,true,"block");
                    break;
                case 51:    // right
                    switchView(3,true,"block");
                    break;
                case 81:// Q - evolving
                    console.log("I'm evolving");
                    easterEgg(e.keyCode);
                    break;
                case 69:// E - shiny
                    console.log("I'm becoming shiny");
                    easterEgg(e.keyCode);
                    break;
                case 76: lightLog();break;//L
        }
    }
}
//Shows the menu containing all the lighting parameters
function showMenu(status){
  document.getElementById("mainMenu").style.display = status;
}

//Mouse controller used to compute the raycast and select items with the mouse
function myOnMouseUp(ev) {
    var normalisedRayDir;
    var rayStartPoint;
    if (!zoom) {//If we are not zoomed by
        normalisedRayDir = computeNormalisedRayDir(ev);
        //The ray starts from the camera in world coordinates
        rayStartPoint = [cx, cy, cz];
        //we iterate on each object that is not called room or pedestal
        entities.forEach(function (entity) {
            if (entity.drawInfo.name != "room" && entity.drawInfo.name != "pedestal") {
                var pos = retrieveWorldPosition(entity);
                var hit = raySphereIntersection(rayStartPoint, normalisedRayDir, pos, 5.0);
                console.log("entity position: " + pos +" hit: "+hit +" on "+entity.id);
                if (hit) {
                    //switches the view to the entity we've hit
                    switchView(entity.id,true,"block");
                }
            }
        });
    }else{//this branch deselects the chosen model and returns to the original view just with the mouse
      //if zoomed we return to the initial position when not hitting the boat
      normalisedRayDir = computeNormalisedRayDir(ev);
      //The ray starts from the camera in world coordinates
      rayStartPoint = [cx, cy, cz];
      //we only have to check the room entity
      entities.forEach(function (entity) {
          if (entity.id == activeID) {//this triggers when we do not hit the currently in view model
              var pos = retrieveWorldPosition(entity);
              var hit = raySphereIntersection(rayStartPoint, normalisedRayDir, pos, 5.0);
              if (!hit) {
                  console.log("I'm going out of zoom w.r.t the current model " + entity.id);
                  reset();
              }
          }
      });
    }
}
//Used to update the current active model with a new Mesh
//Please note the indexing is like that because the positionsInfo
//is indexed from 0->2 while the activeID goes from 1->3
function updateModelPreferences(newValue){
  positionsInfo[activeID-1]["modelSelection"] = newValue;
}
// Update a light "attribute" of the currently in view model with "newValue"
function updatePreferences(attribute, newValue ) {
  lightsInfo[activeID][attribute] = newValue;

}
// Convert decimal to Hex, used for colors
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
// Convert RGB to Hex
function rgbToHex(color) {
    let r = Math.floor(color[0] * 255);
    let g = Math.floor(color[1] * 255);
    let b = Math.floor(color[2] * 255);
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// Change the displayed blocks for the current type:
// ie : for "diffuseSelection" we cycle through each entry and we choose which one to display
function changeSelection(type, selected, name, substring) {
    type.forEach(function (entry) {
        if (selected == entry) {
            document.getElementById(entry).style.display = "block";
        } else {
            document.getElementById(entry).style.display = "none";
        }
    });
    if (substring > 0) {//used to parse every type except generalSelection
                        //as they have values like "diffuse"+value and we need
                        //to extrapolate only value
        //console.log("selected substring is " + selected.substring(substring));
        updatePreferences(name, selected.substring(substring));
    }
}
//Retrieves a node entity from the list just with its ID
function retrieveEntitywID(id){
  var selected;
  entities.forEach( function(entity){
    if( entity.id == id){selected = entity;}
  });
  return selected;
}
//Retrieves the world Matrix of a given node entity
function retrieveWorldPosition(entity){
  return [entity.worldMatrix[3],entity.worldMatrix[7],entity.worldMatrix[11]];
}
// Save new slider's value
function setSlider(value, objectReference) {
    updatePreferences(objectReference, value);
}
// Save new color
function setColor(color, objectReference) {
    R = parseInt(color.substring(1, 3), 16) / 255;
    G = parseInt(color.substring(3, 5), 16) / 255;
    B = parseInt(color.substring(5, 7), 16) / 255;

    updatePreferences(objectReference, [R, G, B]);
}
//We will change the currently selected model with the one specified by the name in newModel
//we will NOT create a new entity but rather overwrite the drawInfo of the currently selected node
function changeModel(newModel){
    updateModelPreferences("modelSelection",newModel);
    changeNode(retrieveEntitywID(activeID), newModel );

}
// Set all the GUIs parameter to match .json input file
function updateGUI() {
    var value;
    //we update two info arrays, one for the positions
    positionsInfo.forEach(function(entity){
      value = entity.name;
      if (entity.id == activeID){
          document.getElementById("modelSelection").value = value;
          //this must be done on modelSelection
          updateModelPreferences("modelSelection", value);
      }
    });
    // one for the light parameters of an object
    lightsInfo.forEach(function(entity){
        if (entity.boatId == activeID) {
            for (var attribute in entity) {
                value = entity[attribute];
                if (attribute == "lightType") {
                    document.getElementById(attribute).value = ("type" + value);
                    changeSelection(typeSelection, "type" + value, attribute, 4);
                } else if (attribute == "lightAmbientType") {
                    document.getElementById(attribute).value = ("ambient" + value);
                    changeSelection(ambientSelection, "ambient" + value, attribute, 7);
                } else if (attribute == "lightDiffuseType") {
                    document.getElementById(attribute).value = ("diffuse" + value);
                    changeSelection(diffuseSelection, "diffuse" + value, attribute, 7);
                } else if (attribute == "lightSpecularType") {
                    document.getElementById(attribute).value = ("specular" + value);
                    changeSelection(specularSelection, "specular" + value, attribute, 8);
                } else if (attribute.includes("Color")) {
                    document.getElementById(attribute).value = rgbToHex(value);
                } else if ( attribute != "boatId" && attribute != "initialSpotY" && attribute != "modelSelection") {
                    document.getElementById(attribute).value = value;
                }
            }
        }
    });
}
//retrieve the code of the currently active model, if it is a porygon, then evolve it!
function easterEgg(keyCode){
  let temp = retrieveEntitywID(activeID);
  switch (temp.drawInfo.name){
    case "porygon": switch (keyCode){
                        case 81: //I'm an evolving porygon
                                changeModel("porygon2");
                                break;
                        case 69://I'm a shiny porygon
                                changeModel("porygonshiny");
                                break;
                        }break;
    case "porygonshiny": switch(keyCode){
                        case 81://evolving Shiny
                                changeModel("porygon2shiny");
                                break;
                        case 69://turn normal
                                changeModel("porygon");
                                break;
                        }break;
    case "porygon2": switch (keyCode){
                        case 81://evolving
                                changeModel("porygonz");
                                break;
                        case 69://shiny
                                changeModel("porygon2shiny");
                        }break;
    case "porygon2shiny": switch (keyCode){
                          case 81://evolved
                                  changeModel("porygonzshiny");
                                  break;
                          case 69://normal
                                  changeModel("porygon2");
                                  break;
                        }break;
    case "porygonz": switch(keyCode){
                        case 69://I'm a shiny porygonz
                                changeModel("porygonzshiny");
                                break;
                      }break;
    case "porygonzshiny":switch(keyCode){
                        case 69://turning normal
                                changeModel("porygonz");
                                break;
                      }break;
                    }
}
//Returns the current camera position and target information
function positionLog(){
  console.log("CAMERA DEBUG LOG");
  console.log("cx "+ cx+ " cy "+ cy+" cz "+ cz);
  console.log("target");
  console.log(target);
}
function lightLog(){
  console.log("LIGHT DEBUG LOG FOR ID "+ activeID );
  console.log(lightsInfo[activeID]);
}
