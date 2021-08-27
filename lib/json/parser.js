//We build three JSON parsers
var jp= {
  parseLights: function(){//this one parses the light configurations for each object
    lightsInfo = parseSpecific(baseDir+"assets/json/lights.json");
    console.log("====LIGHTSINFO======");
    console.log(lightsInfo);
  },
  parsePositions: function(){//this one parses the positions of each displayed object
    positionsInfo = parseSpecific(baseDir+"assets/json/positions.json");
    console.log("====POSITIONS======");
    console.log(positionsInfo);
  },
  parseModelInfos:function(){//this one parses the json containing all the possible displayable objs
    infos = parseSpecific(baseDir+"assets/json/models.json");
    console.log("====MODELS======");
    console.log(infos);
  }
}
//generic parser
function parseSpecific(path){
  var request = new XMLHttpRequest();
  request.open("GET",path,false);
  request.send(null);
  return JSON.parse(request.responseText);
}
