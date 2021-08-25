var lastUpdateTime;

var main = function () {

    console.log(entities);
    // For each entity, link its light locations to the variables of the fragment shader
    entities.forEach(function (entity) {
        console.log(entity);
        gl.useProgram(entity.drawInfo.programInfo);
        lights.lightLocations(entity);
    });

    lastUpdateTime = (new Date).getTime();

    window.addEventListener("keyup", keyFunction, false);
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
    console.log(infos);

    var canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        document.write("GL context not opened");
        return;
    }

    //program creation was once here
    await nodes.loadSceneAssets();


    activeID = 1;
    updateGUI();
    console.log("I've updated the GUI");
    await nodes.buildSceneGraph();
    main();
}
window.onload = init;
