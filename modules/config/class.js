
var SuperJS = require('superjs');
var merge = require('recursive-merge');
var fs = require('fs');
var path = require('path');

module.exports = SuperJS.Class.extend({

  _metaFile: function() {
    this._loadMeta(__filename);
  },

  init: function(app, options) {

    this._super();

    //add configuration path
    app.paths.set('config', app.paths.get('cwd') + options.configPath);

    //find configuration files
    this.find(app.paths.cwd + 'config/');

  },

  find: function(filePath) {

    //maintain reference to instance
    var self = this;

    if( fs.existsSync(filePath) ) {

      //get list of configuration files
      var configs = fs.readdirSync(filePath);

      //load each service configuration
      configs.map(function (fileName) {

        //only attempt to load javascript files
        if( fs.lstatSync(filePath + fileName).isFile() && path.extname(fileName) === '.js') {
          self.load(fileName, filePath, false);
        }

      });
    }

  },

  //load configuration data from disk
  load: function(fileName, filePath, required, name) {

    var fileNameParts = fileName.split('.');

    //determine filename and name to use as the reference
    if( fileNameParts.length > 1 ) {
      name = name || fileNameParts[0];
    } else {
      name = name || fileName;
      filename = fileName + '.js';
    }

    //attempt to load server configuration
    if( fs.existsSync(filePath + fileName) ) {

      this.log.debug('loading config:', filePath + fileName);

      if( typeof this[name] === 'object' ) {
        this[name] = merge(this[name], require(filePath + fileName));
      } else {
        this[name] = require(filePath + fileName);
      }

    } else if( required ) {
      throw new SuperJS.Error('missing_configuration', 'The ' + name + ' configuration is required (' + filePath + fileName + ').');
    }

  }

});
