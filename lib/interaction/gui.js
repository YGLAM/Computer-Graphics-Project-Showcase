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
        //These commented lines of code only work if the canvas is full screen
        /*console.log("ClientX "+ev.clientX+" ClientY "+ev.clientY);
        var normX = (2*ev.clientX)/ gl.canvas.width - 1;
        var normY = 1 - (2*ev.clientY) / gl.canvas.height;
        console.log("NormX "+normX+" NormY "+normY);*/

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
// // Calculate the increment to apply to camera and target to allow a smoth transition to the boat
// function smoothTransition(boat) {
//     zoom = true;
//     // Reset variables
//     speedY = 0;
//     speedX = 0;
//     //document.getElementById("legend").style.display = "none";
//     //document.getElementById("inViewLegend").style.display = "block";

//     incrCamX = calculateIncrement(cx, boat[0][0]);//camera to boat x coord
//     incrTargetX = calculateIncrement(target[0], boat[0][0]);//target x to boat x
//     if (boat[0][1] < 0) {
//         incrCamY = calculateIncrement(cy, (-634 + 50));
//         incrTargetY = calculateIncrement(target[1], (-630 + 30));
//     } else {
//         incrCamY = calculateIncrement(cy, (180 + 50));
//         incrTargetY = calculateIncrement(target[1], (180 + 40));
//     }

//     incrCamZ = calculateIncrement(cz, (boat[0][2] + 300));
//     incrTargetZ = calculateIncrement( target[2], (boat[0][2] + 25));
// }
// // Calculate the desired increment to pan the camera to the boat
// function calculateIncrement(myDefault, desired) {
//     return (desired - myDefault) / deltaZoom;
// }
