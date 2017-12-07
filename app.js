
//express
var express = require('express');
var app = express();
var path = require('path');

//Set Ports
app.use(express.static(__dirname + '/public'));
app.set('port', process.env.PORT || 3000);

// require bodyParser
var bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

var cookieParser = require('cookie-parser');
app.use(cookieParser());

//Handlebars
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//Database
var mongojs = require('mongojs');
//Used the create ObjectID to search the _id field
var ObjectId = require('mongojs').ObjectID;
//Create the database, and the records
var db = mongojs('Warehouse', ['items', 'purchaseOrders', 'skids']);


//Set up listener on port 3000
app.listen( app.get('port'), function () {
	console.log('App listening on localhost:3000!');
	console.log('Stop with Ctrl-C');
});

//GET
//Get the default page
app.get('/', function(req,res ){
    res.render('home');
});

//GET home
//render the home page
app.get('/home', function(req,res ){
    res.render('home');
});

//GET addItem
//render the addItem page
app.get('/addItemPage', function(req,res ){
    res.render('addItem');
});

//GET viewItems Page
//Render the viewItems page
app.get('/viewItems', function (req, res){
    res.render('viewItems');
});

//GET createPO page
//Render the createPO page
app.get('/createPO', function(req,res ){
    res.render('createPO');
});

//GET receivePO page
//Render the receivePO page
app.get('/receivePO', function(req,res ){
    res.render('receivePO');
});

//GET createVR page
//Render the createVR page
app.get('/createVR', function(req,res ){
    res.render('createVR');
});

//GET findSkid page
//Render the findSkid page
app.get('/findSkid', function(req,res ){
    res.render('findSkid');
});

//GET putAway page
//Render the putAway page
app.get('/putAway', function(req,res ){
    res.render('putAway');
});

//GET putAway page
//Render the putAway page
app.get('/assignVR', function(req,res ){
    res.render('assignVR');
});

//GET replen page
//Render the replen page
app.get('/replen', function(req,res ){
    res.render('replen');
});

//Get items
//Get all items in the database
app.get('/items', function (req, res) {
    db.items.find( function (err, docs){
        if (err) {
            console.log(err);
        } else {
            res.json(docs);
        }
    });
});

//Get items
//Get all items in the database
app.get('/items/:sku', function (req, res) {
    db.items.find( {"sku" : req.params.sku}, function (err, docs){
        if (docs.length == 0) {
            res.end('false');
        } else {
            res.json(docs);
        }
    });
});

//POST items
//Add item to items database
app.post('/items', function (req, res){
    var body = req.body;

    db.items.insert(req.body, function(err, docs) {
        if (err) {
            console.log(err);
        } else {
            res.end("Added");
        }
    });
});

//DELETE items
//Given a SKU number, delete it from the database
app.delete('/items/:sku', function (req, res){
   db.items.remove({"sku" : req.params.sku}, function(err, docs) {
        if (err) {
                        console.log(err);
        } else {
                res.end("Deleted!");
        }
    });
});

//POST purchaseOrders
//Add a purshe Order to the list
//  Pre condition before adding
//      - Set default order status
//      - Generate order number (number of orders + 1)
//  Post condition after adding
//      - Return order number
app.post('/purchaseOrders', function(req, res){
    var body = req.body;

    db.purchaseOrders.find(function(err, docsFind) {

        db.purchaseOrders.insert({
                                    "status" : "open",
                                    "orderNumber" : String(docsFind.length + 1),
                                    "items" : body
                                }, function (err, docsAdd){
                                    res.end("PO Created, ref # " + String(docsFind.length + 1));
        });
    });
});

//GET purchaseOrders/orderNumber
//Given orderNumber, find that purchaseOrder
app.get('/purchaseOrders/:orderNumber', function(req, res){
    db.purchaseOrders.find( {"orderNumber" : String(req.params.orderNumber)}, function (err, docs){
        if (docs.length == 0) {
            res.end('false');
        } else {
            res.json(docs);
        }
    });
});

//put purchaseOrders/orderNumber
//Given orderNumber, find that purchaseOrder and update the qtyRec
//Set order status to closed if all items have been received.
app.put('/purchaseOrders/:orderNumber', function(req, res){

    for(var i = 0 ; i <= req.body.length ; i++){
        
        if(i == req.body.length){
            //Looped all items, then it didnt find any items that still need to be received
            //Update order status to closed
            db.purchaseOrders.update( {"orderNumber" : String(req.params.orderNumber)}, {$set:{"status" : "closed"}}, function (err, docs){
            });
        }
        else if(req.body[i].qtyRec < req.body[i].qtyOrd){
            //Still waiting on items to receive, stop checking, drop out of the loop
            break;
        }
        else{//req.body[i].qtyRec >= req.body[i].qtyOrd
            //Design Note, How to handle overage shipped?
        }
    }


    db.purchaseOrders.update( {"orderNumber" : String(req.params.orderNumber)}, {$set:{"items" : req.body}}, function (err, docs){
        res.end("Items Received");
    });
});

//POST vr
//Create a vr record
//      Given sku, po, and quantity (req.body)
//      Create vrID (number of VRs + 1)
//      Location is defaulted to 0, 0, 0
//      Return vrID
app.post('/vr', function(req, res){

    var body = req.body;
    db.skids.find(function(err, docsFind) {

        db.skids.insert({
                                    "vrID" : String(docsFind.length + 1),
                                    "sku" : body.sku,
                                    "po" : body.po,
                                    "qty" : body.qty,
                                    "location": [0, 0, 0]
                                }, function (err, docsAdd){
                                    res.end("VR Created, VRID# " + String(docsFind.length + 1));
        });
    });
});

//GET vr
//Return all VR records
app.get('/vr', function(req, res){
    db.skids.find(function( err, docs){
        res.json(docs);
    })
});

//GET vr
//Return vr, given vr id
app.get('/vr/findVR/:vrID', function(req, res){
    db.skids.find({'vrID': String(req.params.vrID)}, function(err, docs){
        res.json(docs);
    });
});

//GET vr
//Return vr, given sku
app.get('/vr/findSKU/:findSKU', function(req, res){
    db.skids.find({'sku': String(req.params.findSKU)},  function(err, docs){
        res.json(docs);
    });
});

//GET vr
//Return vr, given PO
app.get('/vr/findPO/:findPO', function(req, res){
    db.skids.find({'po': String(req.params.findPO)},  function(err, docs){
        res.json(docs);
    });
});

//GET unassigned-VR
//Return list of VR IDs located at [0,0,0]
app.get('/vr/findUnassigned', function(req, res){
    db.skids.find({'location':[0,0,0]}, function(err,docs){
        res.json(docs);
    });
});

//PUT vr
//Pick an item, given a vrID(params), and pickCount (body)
app.put('/vr/pickItem/:vrID', function(req, res){

    var body = req.body;
    db.skids.find({'vrID': String(req.params.vrID)},  function(err, docsFind){

        db.skids.update({'vrID': String(req.params.vrID)}, {$set:{'qty' : String(docsFind[0].qty - body.pickCount)}}, function(err, docs){
            res.end("picked");
        });
    });
});

//PUT VR Location
//Change the location of a given VR
//New location must be empty
app.put('/vr/assignVR/:vrID', function (req, res){
    var body = req.body;

    db.skids.find({'location' : [body.aisle, body.section, body.slot]}, function(errFind, docsFind){
        if(docsFind.length == 0){
            db.skids.update({'vrID': String(req.params.vrID)}, {$set:{'location' : [body.aisle, body.section, body.slot]}}, function(errUpdate, docsUpdate){
                    res.end("assigned");
               
            });
        }
        else{
            res.end("This location is not empty");
        }
    })
});

//GET Replen
//Return list where qty <= 0
app.get('/vr/getReplen', function (req, res){

    db.skids.find({"qty":{$lte : "0"}}, function(errFind, docsFind){
        
        res.json(docsFind);
    })
});