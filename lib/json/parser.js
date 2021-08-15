var jp= {
  parseLights: function(){
    var request = new XMLHttpRequest();
    request.open("GET",baseDir + "assets/lightData/lights.json", false);
    request.send(null);
    lightsInfo = JSON.parse(request.responseText);
    console.log(lightsInfo);
    activeBoat = lightsInfo[0];
  }
}
