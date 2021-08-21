//Calculate the increment to apply to camera and target to allow a smoth transition to the boat
/*function smoothTransition(boat) {
     speedY = 0;
     speedX = 0;


     incrCamX = calculateIncrement(cx, boat[0][0]);//camera to boat x coord
     incrTargetX = calculateIncrement(target[0], boat[0][0]);//target x to boat x
     if (boat[0][1] < 0) {
         incrCamY = calculateIncrement(cy, (-634 + 50));
         incrTargetY = calculateIncrement(target[1], (-630 + 30));
     } else {
         incrCamY = calculateIncrement(cy, (180 + 50));
         incrTargetY = calculateIncrement(target[1], (180 + 40));
     }

     incrCamZ = calculateIncrement(cz, (boat[0][2] + 300));
     incrTargetZ = calculateIncrement( target[2], (boat[0][2] + 25));
 }*/
// Calculate the desired increment to pan the camera to the boat
/* function calculateIncrement(myDefault, desired) {
     return (desired - myDefault) / deltaZoom;
}*/
