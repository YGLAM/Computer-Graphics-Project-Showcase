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
