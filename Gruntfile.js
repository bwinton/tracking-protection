/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*eslint-env node */

'use strict';

module.exports = function(grunt){

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
  });

  /* Build and deploy tasks. */

  grunt.registerTask('amo', 'Build the add-on for AMO', function() {
    var done = this.async();
    grunt.util.spawn({
      cmd: 'jpm',
      args: ['xpi']
    }, function spawned(error, result) {
      grunt.log.ok(result);
      grunt.log.ok('Add-on built.');
      var pkg = grunt.config.get('pkg');
      var xpiName = pkg.id + '-' + pkg.version + '.xpi';
      grunt.file.copy(xpiName,
                      'web/tracking-protection.xpi',
                      {'encoding': null});
      grunt.file.delete(xpiName);
      grunt.log.ok('Renamed XPI…');
      done();
    });
  });


  grunt.registerTask('copy', 'Copy the files to the server.', function() {
    var done = this.async();
    this.requires(['amo']);

    if (!grunt.file.exists('/Volumes/People/public_html/tracking-protection')) {
      grunt.log.error('Missing remote directory!  Please launch ExpanDrive.');
      done(false);
      return;
    }

    grunt.file.copy('web/tracking-protection.xpi',
                    '/Volumes/People/public_html/tracking-protection/tracking-protection.xpi',
                    {'encoding': null});
    grunt.log.ok('Copied XPI…');
    grunt.file.copy('web/index.html',
                    '/Volumes/People/public_html/tracking-protection/index.html',
                    {'encoding': null});
    grunt.log.ok('Copied index.html…');
  });

  grunt.registerTask('deploy', 'Build the add-on and copy the files.', ['amo', 'copy']);


  /* Testing tasks. */

  grunt.registerTask('run', 'Run a testing version of the add-on', function() {
    var done = this.async();
    var run = grunt.util.spawn({
      cmd: 'jpm',
      args: ['run',
        '-b',
        '/Applications/Local/FirefoxNightly.app'
      ]
    }, function spawned(error, result, code) {
      if (code !== 0) {
        console.log(error);
      }
      done();
    });
    if (run.stderr) {
      run.stderr.on('data', function (buf) {
        grunt.log.ok(buf);
      });
    }
  });

};
