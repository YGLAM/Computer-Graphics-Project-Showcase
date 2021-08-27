//This algorithm is taken from the book Real Time Rendering fourth edition
function raySphereIntersection(rayStartPoint, rayNormalisedDir, sphereCentre, sphereRadius) {
    //Distance between sphere origin and origin of ray
    var l = [sphereCentre[0] - rayStartPoint[0], sphereCentre[1] - rayStartPoint[1], sphereCentre[2] - rayStartPoint[2]];
    var l_squared = l[0] * l[0] + l[1] * l[1] + l[2] * l[2];
    //If this is true, the ray origin is inside the sphere so it collides with the sphere
    if (l_squared < (sphereRadius * sphereRadius)) {
        console.log("ray origin inside sphere");
        return true;
    }
    //Projection of l onto the ray direction
    var s = l[0] * rayNormalisedDir[0] + l[1] * rayNormalisedDir[1] + l[2] * rayNormalisedDir[2];
    //The spere is behind the ray origin so no intersection
    if (s < 0) {
        console.log("sphere behind ray origin");
        return false;
    }
    //Squared distance from sphere centre and projection s with Pythagorean theorem
    var m_squared = l_squared - (s * s);
    //If this is true the ray will miss the sphere
    if (m_squared > (sphereRadius * sphereRadius)) {
        console.log("m squared > r squared");
        return false;
    }
    //Now we can say that the ray will hit the sphere
    console.log("hit");
    return true;
}

function computeNormalisedRayDir(event){
  //This is a way of calculating the coordinates of the click in the canvas taking into account its possible displacement in the page
  var top = 0.0, left = 0.0;
  canvas = gl.canvas;
  while (canvas && canvas.tagName !== 'BODY') {
      top += canvas.offsetTop;
      left += canvas.offsetLeft;
      canvas = canvas.offsetParent;
  }
  //console.log("left " + left + " top " + top);
  var x = event.clientX - left;
  var y = event.clientY - top;
  //console.log("ClientX " + x + " ClientY " + y);
  var normX = (2 * x) / gl.canvas.width - 1;
  var normY = 1 - (2 * y) / gl.canvas.height;
  //console.log("NormX " + normX + " NormY " + normY);

  var projInv = utils.invertMatrix(perspectiveMatrix);
  var viewInv = utils.invertMatrix(viewMatrix);

  var pointEyeCoords = utils.multiplyMatrixVector(projInv, [normX, normY, -1, 1]);
  //console.log("Point eye coords " + pointEyeCoords);

  var rayEyeCoords = [pointEyeCoords[0], pointEyeCoords[1], pointEyeCoords[2], 0];

  //We find the direction expressed in world coordinates by multipling with the inverse of the view matrix
  var rayDir = utils.multiplyMatrixVector(viewInv, rayEyeCoords);
  //console.log("Ray direction " + rayDir);
  var normalisedRayDir = utils.normalizeVector3(rayDir);
  //console.log("normalised ray dir " + normalisedRayDir);
  return normalisedRayDir;
}
