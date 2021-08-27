var lastUpdateTime;
var shaderDir;
var baseDir;
var gl;

var main = function () {
    // For each entity, link its light locations to the variables of the fragment shader
    entities.forEach(function (entity) {
        //console.log(entity);
        gl.useProgram(entity.drawInfo.programInfo);
        entity.drawInfo.textureRef = tl.loadSyncTextures(baseDir + entity.drawInfo.textureSrc, entity);

        lights.lightLocations(entity);
    });
    lastUpdateTime = (new Date).getTime();

    window.addEventListener("keyup", keyFunction, false);
    window.addEventListener("keydown", keyFunctionDown, false);
    canvas.addEventListener("mouseup", myOnMouseUp, false);

    cameraScene();
}

var init = async function () {

    var path = window.location.pathname;
    var page = path.split("/").pop();
    baseDir = window.location.href.replace(page, '');
    shaderDir = baseDir + "shaders/";
    jp.parseModelInfos();
    jp.parseLights();
    jp.parsePositions();

    var canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        document.write("GL context not opened");
        return;
    }
    await nodes.loadSceneAssets();
    activeID = 1;
    updateGUI();
    await nodes.buildSceneGraph();
        main();
}
window.onload = init;
