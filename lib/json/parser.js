
var jp= {
  parseLights: function(){
    lightsInfo = parseSpecific(baseDir+"assets/json/lights.json");
    console.log("====LIGHTSINFO======");
    console.log(lightsInfo);
  },
  parsePositions: function(){
    positionsInfo = parseSpecific(baseDir+"assets/json/positions.json");
    console.log("====POSITIONS======");
    console.log(positionsInfo);
  },
  parseModelInfos:function(){
    infos = parseSpecific(baseDir+"assets/json/models.json");
    console.log("====MODELS======");
    console.log(infos);
  }
}
function parseSpecific(path){
  var request = new XMLHttpRequest();
  request.open("GET",path,false);
  request.send(null);
  return JSON.parse(request.responseText);
}
