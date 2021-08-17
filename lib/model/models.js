class Model_Info {
    constructor(id, src, tx_src) {
        this.id = id;
        this.src = src;
        this.tx_src = tx_src;
    }
}
/*---MODELS---*/
// Boat
var boatModel;
var boatInfo = new Model_Info('boat','assets/boat/boat.obj', 'assets/boat/boat_diffuse.bmp');
// Pedestal
var pedestalModel;
var pedestalInfo = new Model_Info('pedestal','assets/pedestal/pedestal.obj','assets/pedestal/pedestal3.png');
// Room
var roomModel;
var roomInfo = new Model_Info('room','assets/room/room.obj','assets/room/room.png');
// World
var worldModel;
var worldInfo = new Model_Info('world','assets/world/world.obj','assets/world/world.png');
// X-Wing
var xwingModel;
var xwingInfo = new Model_Info('xwing','assets/xwing/xwing.obj','assets/xwing/xwing.png');

var infos = [boatInfo,pedestalInfo,roomInfo,worldInfo,xwingInfo];
