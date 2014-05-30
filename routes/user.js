//var express = require('express');
//var router = express.Router();

var app = require('../app');

// Get entry list
app.get('/entrylist', function(req, res) {
    var db = req.db;
    db.collection('entries').find().toArray(function(err, items) {
        res.send(items);
    });
});

// Add entry to list
app.post('/addentry', function(req, res) {
    var db = req.db;
    var check = req.body;
    var json_keys = Object.keys(req.body);
    var parsed_entry = JSON.parse(json_keys[0]);

    db.collection('entries').insert(parsed_entry, function(err, result) {
      if(err === null) {
        res.send({msg: ''});
      }
      else {
        res.send({msg: err});
      }
    });
});

// Remove entry from list
app.delete('/deleteEntry/:id', function(req, res) {
    var db = req.db;
    var entry_id = JSON.parse(req.params.id);

    db.collection('entries').remove({_id: entry_id}, function(err, nresult) {
      if(nresult === 1) {
        res.send({msg: ''});
      }
      else {
        res.send({msg: err});
      }
    });
});

// Update state of entry
app.get('/updateEntry/:id/:stat', function(req, res) {
  var db = req.db,
      entry_id = JSON.parse(req.params.id),
      new_status = req.params.stat;

  db.collection('entries').updateById(
    entry_id,
    {
      $set: { status: new_status }
    },
    function(err, result) {
      if(err === null) {
	res.send({ msg: '' });
      }
      else {
	res.send({ msg: err });
      }
    }
  );
}); 

// module.exports = router;
