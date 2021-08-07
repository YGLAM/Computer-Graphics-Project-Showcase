//To Do : Used to load all the model informations
function Model_Info(id,src,tx_src){
  this.id = id
  this.src = src;
  this.tx_src = tx_src;
}
/*---MODELS---*/
// Boat
var boatModel;
var boatInfo = new Model_Info('boat','assets/boat/boat.obj', 'assets/boat/boat_diffuse.bmp');
// Pedestal
var pedestalModel;
var pedestalInfo = new Model_Info('pedestal','assets/pedestal/pedestal.obj','assets/pedestal/pedestal.png');
// Room
var roomModel;
var roomInfo = new Model_Info('room','assets/room/room.obj','assets/room/room.png');
// World
var worldModel;
var worldInfo = new Model_Info('world','assets/world/world.obj','assets/world.png');
// X-Wing
var xwingModel;
var xwingInfo = new Model_Info('xwing','assets/xwing/xwing.obj','assets/xwing/xwing.png');
