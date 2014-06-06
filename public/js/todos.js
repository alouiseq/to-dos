// Knockout.js Implementation of ToDos (View Model)

// =================== DOM Ready =============================
$(document).ready(function() {
  var viewmodel = new TasksViewModel();
  ko.applyBindings(viewmodel);
  viewmodel.populate('daily');
  viewmodel.populate('project');
});

// =================== Functions =============================
function TableRow (counter, priority, entry_type, entry, status) {
  this._id = counter;
  this.rank = priority;
  this.term = entry_type;
  this.entry = ko.observable(entry);
  this.status = ko.observable(status);
}

function TasksViewModel() {
  var self = this,
      counter = {daily: 0, project: 1},  // dailies are even and projects are odd
      priority = {daily: 1, project: 1}, // daily max = 20, project max = 10
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
      var sortedlist = entrylist.sort(function(a, b) {
        if (a.rank < b.rank) {
	  return -1;
	}
        if (a.rank > b.rank) {
	  return 1;
	}
        alert('Rank collision with ' + a.rank + ' and ' + b.rank + '...'
        + 'Aborting now!');
      });
      $.each(sortedlist, function(index, dbentry) {
          var data = new TableRow(dbentry._id, dbentry.rank, dbentry.term, dbentry.entry, dbentry.status);
          self.table[type + '_entries'].push(data); 
          if (dbentry._id >= counter[type]) {
	    counter[type] = dbentry._id + 2;
	  }
      });
    });
  };

  // Add model view data
  self.addCell = function(type, mv, event) {
    if(event.which == 13) {   // enter key
      entry = 'entry_' + type;
      entries = type + '_entries';
      data = new TableRow(counter[type], priority[type]++, type, mv[entry](), self.status[0]);
      counter[type] = counter[type] + 2;
      self.table[entries].push(data);
      json_data = ko.toJSON(data);  
      //var parsed = JSON.parse(json_data);
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

  // Sorting entries in a table
  ko.bindingHandlers.sortableTable = {
    init: function(element, valueAccessor, allBindings) {
      $(element).sortable({
        update: function(event, ui) {
          var term = allBindings.get('term');
	  // grab entries from table as observable array
          var entries = valueAccessor();
	  // grab item dragged via DOM node from jQuery array object
          var item_data = ko.dataFor(ui.item[0]);
	  // new position of item dropped
	  var pos = ui.item.parent().children().index(ui.item);
	  // update sorted table
          entries.remove(item_data);
	  entries.splice(pos, 0, item_data);
	  // send the updated table back to the server
          var data = {item: item_data, position: pos, term: term},
	      json_data = JSON.stringify(data);

	  $.post('/addsorted', json_data, function(response) {
	    if(response !== null) {
	      alert('ERROR post to addsorted: ' + response.msg);
	    }
	  });
	}
      });
    }
  };

  // Edit and update entry
}
