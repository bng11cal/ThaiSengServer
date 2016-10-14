var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk('localhost:27017/ThaiSeng');

router.get('/', function(req,res) {
    var collection = db.get('products');

    // Default query values
    var ascending = 1;
    var sortBy = 'name';
    var limit = 0;
    var skip = 0;
    var sorter = {};
    var searchQ = "";

    if (req.query.ascending == "false") ascending = -1;
    if (req.query.sortBy) sortBy = req.query.sortBy
    if (req.query.limit) limit = req.query.limit;
    if (req.query.page && req.query.page > 0) skip = (req.query.page - 1) * limit;
    sorter[sortBy] = ascending;

    if (req.query.q) {
        collection.ensureIndex({"$**": "text"});
        var query = {$text: {$search: req.query.q}};
        if (req.query.filterKey) query[req.query.filterKey] = req.query.filterVal;
        collection.find(query, {fields: {score: {$meta: "textScore"}}, sort: {score: {$meta: "textScore"}}, limit: limit, skip: skip}, function(err, products) {
            if (err) {
                console.log(err);
                throw err;
            }
            collection.count(query, {fields: {score: {$meta: "textScore"}}, sort: {score: {$meta: "textScore"}}, limit: limit, skip: skip}, function(err, count) {
                if (err) {
                    console.log(err);
                    throw err;
                }
                res.set('X-Total-Count', count);
                res.json(products);
            });
        });
    } else {
        var query = {}
        if (req.query.filterKey) query[req.query.filterKey] = req.query.filterVal;
        collection.find(query, {sort: sorter, limit: limit, skip: skip}, function(err, products) {
            if (err) {
                console.log(err);
                throw err;
            }
            collection.count(query, {sort: sorter, limit: limit, skip: skip}, function(err, count) {
                if (err) {
                    console.log(err);
                    throw err;
                }
                res.set('X-Total-Count', count);
                res.json(products);
            });
        });
    }
});

// router.get('/category/:category', function(req,res) {
//    var collection = db.get('products');

//     // Default query values
//     var ascending = 1;
//     var sort = "name";
//     var limit = 0;
//     var skip = 0;
//     var sorter = {};

//     if (req.query.ascending == "false") ascending = -1;
//     if (req.query.sort) sort = req.query.sort;
//     if (req.query.limit) limit = req.query.limit;
//     if (req.query.page && req.query.page > 0) skip = (req.query.page - 1) * limit;

//     sorter[sort] = ascending;

//     collection.find({category: req.params.category}, {sort: sorter, limit: limit, skip: skip}, function(err, products) {
//         if (err) throw err;
//         res.json(products);
//     });
// });

// router.get('/search', function(req,res) {
//     var collection = db.get('products');

//     collection.ensureIndex({"$**": "text"});

//     collection.find({$text: {$search: req.query.q}}, 
//         {fields: {score: {$meta: "textScore"}}, sort: {score: {$meta: "textScore"}}}, function(err, products) {
//             if (err) throw err;
//             res.json(products);
//     });
// });

router.get('/:id', function(req, res) {
    var collection = db.get('products');
    collection.findOne({ _id: req.params.id }, function(err, product){
        if (err) throw err;

        res.json(product);
    });
});

router.post('/', function(req, res){
    var collection = db.get('products');
    collection.insert(req.body, function(err, product){
        if (err) throw err;

        res.json(product);
    });
});

router.put('/:id', function(req, res){
    var collection = db.get('products');
    collection.update({
        _id: req.params.id
    }, req.body, function(err, product){
        if (err) throw err;

        res.json(product);
    });
});

router.delete('/:id', function(req,res) {
    var collection = db.get('products');
    collection.remove({
        _id: req.params.id
    }, function(err, product) {
        if (err) throw err;

        res.json(product);
    }
    );
});

router.post('/images/', function(req,res) {

    if (!req.files) {
        console.log('No files were uploaded')
        res.send('No files detected to upload');
        return;
    }

    var file = req.files.file;
    console.log(req.body);

    var resJSON = {};
    resJSON['imageURL'] = 'images/';
    resJSON['thumbnailURL'] = 'images/';
    file.mv('images/im.jpg', function (err) {
        if (err) {
            console.log(err);
            throw err;
        }
        res.send('File uploaded!');
    });
});

module.exports = router