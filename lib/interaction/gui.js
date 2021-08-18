var activeID = 0;
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
function keyFunction(e) {
    // If the view is not zoomed on a boat, I can zoom on a boat
    if (!zoom) {
        // Set viewMatrix to zoom on a certain boat and set zoom to true
        switch (e.keyCode) {
            case 49:    // 1
                // console.log("key 1");
                cx = -20.0;
                cy = 13.0;
                cz = 15.0;
                angleV = -15.0;
                zoom = true;
                break;
            case 50:    // 2
                // console.log("key 2");
                cx = 0.0;
                cy = 13.0;
                cz = 15.0;
                angleV = -15.0;
                zoom = true;
                break;
            case 51:    // 3
                // console.log("key 3");
                cx = 20.0;
                cy = 13.0;
                cz = 15.0;
                angleV = -15.0;
                zoom = true;
                break;
        }
    }

    // If the view is on a boat, I can only press "esc" to reset it
    else /*if (zoom)*/ {
        // Reset viewMatrix, set zoom to false and empty keys array
        switch (e.keyCode) {
            case 27:    // Escape
                // console.log("key esc");
                cx = 0.0;
                cy = 20.0;
                cz = 35.0;
                angleV = -20.0;
                zoom = false;
                break;
        }
    }
}
function myOnMouseUp(ev) {
    if (!zoom) {
        //This is a way of calculating the coordinates of the click in the canvas taking into account its possible displacement in the page
        var top = 0.0, left = 0.0;
        canvas = gl.canvas;
        while (canvas && canvas.tagName !== 'BODY') {
            top += canvas.offsetTop;
            left += canvas.offsetLeft;
            canvas = canvas.offsetParent;
        }
        console.log("left " + left + " top " + top);
        var x = ev.clientX - left;
        var y = ev.clientY - top;
        console.log("ClientX " + x + " ClientY " + y);
        var normX = (2 * x) / gl.canvas.width - 1;
        var normY = 1 - (2 * y) / gl.canvas.height;
        console.log("NormX " + normX + " NormY " + normY);

        var projInv = utils.invertMatrix(perspectiveMatrix);
        var viewInv = utils.invertMatrix(viewMatrix);

        var pointEyeCoords = utils.multiplyMatrixVector(projInv, [normX, normY, -1, 1]);
        console.log("Point eye coords " + pointEyeCoords);

        var rayEyeCoords = [pointEyeCoords[0], pointEyeCoords[1], pointEyeCoords[2], 0];

        //We find the direction expressed in world coordinates by multipling with the inverse of the view matrix
        var rayDir = utils.multiplyMatrixVector(viewInv, rayEyeCoords);
        console.log("Ray direction " + rayDir);
        var normalisedRayDir = utils.normalizeVector3(rayDir);
        console.log("normalised ray dir " + normalisedRayDir);
        //The ray starts from the camera in world coordinates
        var rayStartPoint = [cx, cy, cz];

        //we iterate on each object called boat
        entities.forEach(function (entity) {
            if (entity.drawInfo.name == "boat") {
                var pos = [entity.worldMatrix[3], entity.worldMatrix[7], entity.worldMatrix[11]];
                console.log("entity position: " + pos);
                var hit = raySphereIntersection(rayStartPoint, normalisedRayDir, pos, 5.0);
                if (hit) {
                    console.log("hit entity number " + entity.id);
                    // smoothTransition()
                    cx = entity.worldMatrix[3];
                    cy = 13.0;
                    cz = 15.0;
                    angleV = -15.0;
                    zoom = true;
                }
            }
        });
    }
}
// Update the values on the lights object, only for the active boat
function updatePreferences(attribute, newValue) {
  //reference is the name of an attribute
    entities.forEach(function(entity) {
        if (entity.id == activeID) {
           console.log("attribute is " + attribute);
           console.log("update Preference is doing "+ lightsInfo[activeID][attribute]);
           console.log("the new value is  "+newValue);
           //entity.drawInfo.lightLocation[attribute] = newValue;
           lightsInfo[activeID][attribute]= newValue;
           console.log("there should be" +lightsInfo[activeID][attribute]);

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
    let r = Math.floor(color[0]*255);
    let g = Math.floor(color[1]*255);
    let b = Math.floor(color[2]*255);
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// Change displayed blocks for first selection (Type, Ambient, Diffuse, Specular)
function changeSelection( type , selected, name, substring ){
  console.log("type:  "+type);
  console.log("selected:  "+ selected);
  console.log("name  " + name);
  type.forEach( function(entry){
    if(selected == entry){
      console.log("current entry is  "+entry);
      document.getElementById(entry).style.display ="block";
    }else{
      console.log("blocked entry is  "+entry);
      document.getElementById(entry).style.display ="none";
    }
  });
  if( substring > 0){
      console.log("selected substring is "+selected.substring(substring));
      updatePreferences(name, selected.substring(substring));}
}
// Save new color
function setColor(color, objectReference) {
    R = parseInt(color.substring(1,3), 16) / 255;
    G = parseInt(color.substring(3,5), 16) / 255;
    B = parseInt(color.substring(5,7), 16) / 255;

    updatePreferences(objectReference, [R, G, B]);
}
function changeActiveModel(id){
  activeID = id;
}
// Save new slider's value
function setSlider(value, objectReference) {
    updatePreferences(objectReference, value);
}
//We have to change the active selection when clicking on a model
function changeDropdown(value) {
    // Debug
    //console.log(value);
}
// Set all the GUIs parameter to match .json input file
function updateGUI() {
    var value;
    // Cycle all attributes
    //retrieve activeBoat
    entities.forEach(function (entity){
      if ( entity.id == activeID){
        for( var attribute in entity.drawInfo.lightLocation){
          value = entity.drawInfo.lightLocation.attribute;
          if ( attribute == "lightType"){
            document.getElementById(attribute).value = ("type" + value);
            changeSelection(typeSelection,"type"+value,attribute,4);
          }else if( attribute =="lightAmbient"){
            document.getElementById(attribute).value = ("ambient" + value);
            changeSelection(ambientSelection, "ambient"+value,attribute,7);
          }else if( attribute =="lightDiffuse"){
            document.getElementById(attribute).value = ("diffuse" + value);
            changeSelection(diffuseSelection,"diffuse"+value,attribute,7);
          }else if( attribute = "lightSpecular"){
            document.getElementById(attribute).value = ("specular" + value);
            changeSelection(specularSelection,"specular"+value,attribute,8);
          }else if (attribute.includes("Color")){
            document.getElementById(attribute).value = rgbToHex(value);
          }else if (!attribute.includes("spotTheta") && !attribute.includes("spotPhi")){
            // Set all available sliders (spotTheta and spotPhi sliders are not available)
            document.getElementById(attribute).value = value;
          }
      }
    }
  });
}
