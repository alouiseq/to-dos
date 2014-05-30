// Knockout.js Implementation of ToDos (View Model)

// =================== DOM Ready =============================
$(document).ready(function() {
  var viewmodel = new TasksViewModel();
  ko.applyBindings(viewmodel);
  viewmodel.populate('daily');
  viewmodel.populate('project');
});

// =================== Functions =============================
function TableRow (counter, entry_type, entry, status) {
  this._id = counter;
  this.term = entry_type;
  this.entry = ko.observable(entry);
  this.status = ko.observable(status);
}

function TasksViewModel() {
  var self = this;
  var counter = 0,
      entry = '',
      entries = '',
      newstat = '',
      data = {};
      json_data = {};
  self.entry_daily = ko.observable("");
  self.entry_project = ko.observable("");
  self.status = ["incomplete", "completed", "removed"];
  self.table = {
    daily_entries: ko.observableArray(),
    project_entries: ko.observableArray()
  };

  // Populate table
  self.populate = function(type) {
    $.getJSON('/entrylist', function(items) {
      var entrylist = items.filter(function(item) {
          if (item.term === type) {
            return item;
          }
      });
      $.each(entrylist, function(index, dbentry) {
          var data = new TableRow(dbentry._id, dbentry.term, dbentry.entry, dbentry.status);
          self.table[type + '_entries'].push(data); 
          if (dbentry._id > counter) {
	    counter = dbentry._id;
	  }
          else {
          }
      });
    });
  };

  // Add model view data
  self.addCell = function(type, mv, event) {
    if(event.which == 13) {   // enter key
      entry = 'entry_' + type;
      entries = type + '_entries';
      data = new TableRow(++counter, type, mv[entry](), self.status[0]);
      self.table[entries].push(data);
      json_data = ko.toJSON(data);  
      var parsed = JSON.parse(json_data);
      $.post('/addentry', json_data, function(response) {
        if (response.msg !== '') {
          alert('Add Error: ' + response.msg);
        }
      }, 'json');
      mv[entry]('');
    }
  };

  // Add and then slide down markup
  self.addSlideDown = function(elem, index, data) {
    $(elem).find('div').hide().slideDown();
  };

  // Remove model view data
  self.removeCell = function(type, parent, data) {
    entries = type + '_entries';
    self.table[entries].remove(data);
    $.ajax({
      url: '/deleteEntry/' + data._id,
      type: 'DELETE',
      success: function(response) {
        if (response.msg !== '') {
          alert('Delete Error: ' + response.msg);
        }
      }
    });
  };

  // Slide up and remove markup 
  self.removeSlideUp = function(elem, index, data) {
    $(elem).find('div').slideUp(function() { $(elem).remove(); });
  };

  // Toggle completed task 
  self.toggleStatus = function(entry) {
    if(entry.status() == self.status[0]) {
      newstat = self.status[1];
    }
    else {
      newstat = self.status[0];
    }
    entry.status(newstat);
    $.get('/updateEntry/' + entry._id + '/' + newstat, function(response) {
        if(response.msg !== '') {
          alert('Update Error: ' + response.msg);
        }
    });
  };
}
