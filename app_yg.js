var lastUpdateTime;

var main = function () {

    console.log(entities);
    // For each entity, link its light locations to the variables of the fragment shader
    entities.forEach(function (entity) {
        console.log(entity);
        gl.useProgram(entity.drawInfo.programInfo);
        //object = retrieveAsset(entity.drawInfo.name);
        lights.lightLocations(entity);
    });

    lastUpdateTime = (new Date).getTime();

    window.addEventListener("keyup", keyFunction, false);
    window.addEventListener("mouseup", myOnMouseUp, false);

    cameraScene();
  //here was animate()
  //here was camera scene()
  //here was keyFunction(e)
  //instead of normaliseVector(vec) we'll use utils.normalizeVector3(vec)
  //here was myOnMouseUp()
}

var init = async function () {

    var path = window.location.pathname;
    var page = path.split("/").pop();
    baseDir = window.location.href.replace(page, '');
    shaderDir = baseDir + "shaders/";

    var canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        document.write("GL context not opened");
        return;
    }
    //program creation was once here
    await nodes.loadSceneAssets();
    // gl.useProgram(program);

    jp.parseLights();
    await nodes.buildSceneGraph();
    main();
}
window.onload = init;
