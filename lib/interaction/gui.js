var activeID = 0;
var tempPos;
var generalSelection = [
    "type",
    "ambient",
    "diffuse",
    "specular"
];
var typeSelection = [
    "typedirect",
    "typepoint",
    "typespot",
    "typenone"
];
var ambientSelection = [
    "ambientambient",
    "ambienthemispheric",
    "ambientnone"
];
var diffuseSelection = [
    "diffuselambert",
    "diffusetoon",
    "diffuseoren",
    "diffusenone"
];
var specularSelection = [
    "specularphong",
    "specularblinn",
    "speculartoonPhong",
    "speculartoonBlinn",
    "specularnone"
];
function changeModelView(pos,angle,zoomStatus){
  cx= pos[0]; cy=pos[1]; cz=pos[2]; angleV = angle;
  zoom = zoomStatus;
}

function keyFunction(e) {
    // If the view is not zoomed on a boat, I can zoom on a boat
    if (!zoom) {
        // Set viewMatrix to zoom on a certain boat and set zoom to true
        switch (e.keyCode) {
            case 49:    // left
                tempPos =[-20.0,13.0,15.0];
                changeModelView(tempPos,-15.0,true);
                changeActiveModel(retrieveEntitywID(1));
                showMenu("block");
                break;
            case 50:    // center
                tempPos =[0.0,13.0,15.0];
                changeModelView(tempPos,-15.0,true);
                changeActiveModel(retrieveEntitywID(2));
                showMenu("block");
                break;
            case 51:    // right
                tempPos =[20.0,13.0,15.0];
                changeModelView(tempPos,-15.0,true);
                changeActiveModel(retrieveEntitywID(3));
                showMenu("block");
                break;
            case 52:
                changeActiveModel(retrieveEntitywID(0));
                showMenu("block");
                break;
        }
    }

    // If the view is on a boat, I can only press "esc" to reset it
    else  {
        switch (e.keyCode) {
            case 27:    // Escape
                tempPos = [0.0,20.0,35.0];
                changeModelView(tempPos,-20.0,false);
                showMenu("none");
                break;
                case 49:    // left
                    tempPos =[-20.0,13.0,15.0];
                    changeModelView(tempPos,-15.0,true);
                    changeActiveModel(retrieveEntitywID(1));
                    showMenu("block");
                    break;
                case 50:    // center
                    tempPos =[0.0,13.0,15.0];
                    changeModelView(tempPos,-15.0,true);
                    changeActiveModel(retrieveEntitywID(2));
                    showMenu("block");
                    break;
                case 51:    // right
                    tempPos =[20.0,13.0,15.0];
                    changeModelView(tempPos,-15.0,true);
                    changeActiveModel(retrieveEntitywID(3));
                    showMenu("block");
                    break;
        }
    }
}
function showMenu(status){
  console.log("I'm setting it to "+status);
  console.log(document.getElementById("mainMenu"));
  document.getElementById("mainMenu").style.display = status;

}
function myOnMouseUp(ev) {
    var normalisedRayDir;
    var rayStartPoint;
    if (!zoom) {
        normalisedRayDir = computeNormalisedRayDir(ev);
        //The ray starts from the camera in world coordinates
        rayStartPoint = [cx, cy, cz];
        //we iterate on each object called boat
        entities.forEach(function (entity) {
            if (entity.drawInfo.name != 0) {
                var pos = [entity.worldMatrix[3], entity.worldMatrix[7], entity.worldMatrix[11]];
                var hit = raySphereIntersection(rayStartPoint, normalisedRayDir, pos, 5.0);
                console.log("entity position: " + pos +"||| hit is"+hit);
                if (hit) {
                    console.log("hit entity number " + entity.id);
                    // smoothTransition()
                    tempPos=[entity.worldMatrix[3],13.0,15.0];
                    changeActiveModel(entity);
                    console.log("New chosen boat" + activeID);
                    showMenu("block");
                    changeModelView(tempPos,-15.0,true);
                }
            }
        });
    }else{
      console.log("I can reach the first branch, current Active ID : "+activeID);//if zoomed we return to the initial position when not hitting the boat
      normalisedRayDir = computeNormalisedRayDir(ev);
      //The ray starts from the camera in world coordinates
      rayStartPoint = [cx, cy, cz];
      //we only have to check the room entity
      //console.log(entities);
      entities.forEach(function (entity) {
          console.log("I'm looking at current entity "+ entity.drawInfo.name+" with ID "+ entity.id);
          if (entity.id == activeID) {
              var pos = [entity.worldMatrix[3], entity.worldMatrix[7], entity.worldMatrix[11]];
              //console.log("this is the currently in view boat " + pos);
              var hit = raySphereIntersection(rayStartPoint, normalisedRayDir, pos, 5.0);
              if (!hit) {
                  console.log("I'm going out of zoom w.r.t the current boat " + entity.id);
                  tempPos = [0.0,20.0,35.0];
                  changeModelView(tempPos,-20.0,false);
                  showMenu("none");
              }else{
                console.log("extra hit");
              }
          }
      });
    }
}
// Update the values on the lights object, only for the active boat
function updatePreferences(attribute, newValue) {
    //reference is the name of an attribute
    entities.forEach(function (entity) {
        if (entity.id == activeID) {
            console.log("attribute is " + attribute);
            console.log("update Preference is doing " + lightsInfo[activeID][attribute]);
            console.log("the new value is " + newValue);
            lightsInfo[activeID][attribute] = newValue;
            console.log("there should be " + lightsInfo[activeID][attribute]);
        }
    });
}
// Convert decimal to Hex
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

// Change displayed blocks for first selection (Type, Ambient, Diffuse, Specular)
function changeSelection(type, selected, name, substring) {
    type.forEach(function (entry) {
        if (selected == entry) {
            document.getElementById(entry).style.display = "block";
        } else {
            document.getElementById(entry).style.display = "none";
        }
    });
    if (substring > 0) {
        console.log("selected substring is " + selected.substring(substring));
        updatePreferences(name, selected.substring(substring));
    }
}
// Save new color
function setColor(color, objectReference) {
    R = parseInt(color.substring(1, 3), 16) / 255;
    G = parseInt(color.substring(3, 5), 16) / 255;
    B = parseInt(color.substring(5, 7), 16) / 255;

    updatePreferences(objectReference, [R, G, B]);
}
function changeActiveModel(entity) {
    console.log("there"+entity);
    activeID = entity.id;
    document.getElementById("currentModel").textContent = entity.drawInfo.name + "  "+ activeID;
    updateGUI();
    //document.getElementById("currentId").textContent = activeID;
}
function retrieveEntitywID(id){
  var selected;
  entities.forEach( function(entity){
    if( entity.id == id){selected = entity;}
  });
  return selected;
}
// Save new slider's value
function setSlider(value, objectReference) {
    updatePreferences(objectReference, value);
}

// Set all the GUIs parameter to match .json input file
function updateGUI() {
    var value;
    console.log("entities ::");
    console.log(lightsInfo);
    console.log("activeID"+ activeID);

    lightsInfo.forEach(function(entity){
        console.log(entity);
        if (entity.boatId == activeID) {
            console.log("and there  "+ entity.id + "  active "+ activeID);
            for (var attribute in entity) {
                console.log("who is attribute");
                console.log(attribute);
                console.log(entity[attribute]);
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
                } else if ( attribute != "boatId" && attribute != "initialSpotY") {
                    document.getElementById(attribute).value = value;
                }
            }
        }
    });
}
