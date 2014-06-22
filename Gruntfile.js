'use strict';

var request = require('request');

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  var reloadPort = 35729, files;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    develop: {
      server: {
        file: 'app.js'
      }
    },
    watch: {
      options: {
        nospawn: true,
        livereload: reloadPort
      },
      server: {
        files: [
          'app.js',
          'routes/*.js'
        ],
        tasks: ['develop', 'delayed-livereload']
      },
      js: {
        files: ['public/js/*.js'],
        options: {
          livereload: reloadPort
        }
      },
      css: {
        files: ['public/css/*.css'],
        options: {
          livereload: reloadPort
        }
      },
      jade: {
        files: ['views/*.jade'],
        options: {
          livereload: reloadPort
        }
      },
      sass: {
        files: 'public/css/style.scss',
        tasks: ['sass:style']
      }
    },
    sass: {
      style: {
        files: {
          'public/css/style.css' : 'public/css/style.scss'
        }
      },
      bootstrap: {
        files: {
          'public/css/bootstrap.css' : 'public/css/bootstrap.scss'
        }
      }
    },
    copy: {
      glyphs: {
        files: [{
	  expand: true,
	  cwd: 'public/css/bootstrap/',
          src: ['*'],
	  dest: 'dist/styles/bootstrap/'
	}]
      }
    },
    jadeUsemin: {
      scripts: {
        options: {
	  tasks: {
	    js: ['uglify']
	  }
	},
	files: [{ src: 'views/layout.jade' }]
      },
      styles: {
        options: {
	  tasks: {
	    css: ['concat', 'cssmin']
	  }
	},
	files: [{ src: 'views/layout.jade' }]
      }
    }
    // Usemin is used instead
/*
    concat: {
      css: {
        src: ['public/css/bootstrap.css', 'public/css/style.css'],
        dest: 'tmp/styles/main.css'
      }
    },
    uglify: {
      myjs: {
        files: {
          'dist/scripts/todos.min.js' : 'public/js/todos.js'
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          'dist/styles/main.min.css' : 'tmp/styles/main.css',
        }
      }
    }
*/
  });

  grunt.config.requires('watch.server.files');
  files = grunt.config('watch.server.files');
  files = grunt.file.expand(files);

  grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
    var done = this.async();
    setTimeout(function () {
      request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','),  function (err, res) {
          var reloaded = !err && res.statusCode === 200;
          if (reloaded) {
            grunt.log.ok('Delayed live reload successful.');
          } else {
            grunt.log.error('Unable to make a delayed live reload.');
          }
          done(reloaded);
        });
    }, 500);
  });

  grunt.registerTask('build', ['jadeUsemin', 'copy']);

  grunt.registerTask('default', ['develop', 'watch']);
};
