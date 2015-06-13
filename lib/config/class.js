
var Ouro = require('ouro');
var Class = require('ouro-base');
var merge = require('recursive-merge');
var fs = require('fs');
var path = require('path');

module.exports = Class.extend(Ouro.Meta, Ouro.Loader, {

  _metaFile: function() {
    this._loadMeta(__filename);
  },

  init: function() {

    //localize the global environment class
    this.env = this._class('env');

    //localize the global path class
    this.paths = this._class('path');

    //default the configuration path
    var configPath = process.env.OURO_CONFIG_PATH || 'config/';

    //add configuration path to globally defined paths
    this.paths.set('config', this.paths.get('cwd') + configPath);

    if( typeof global.ouro.config !== 'object') {
      global.ouro.config = {};
    }

    //find & load configuration files
    this.find(this.paths.get('config'));

    //console.log('configurations loaded:',Object.keys(global.ouro.config));

  },

  find: function(filePath) {

    //maintain reference to instance
    var self = this;

    //check the file path exists
    if( fs.existsSync(filePath) ) {

      //get list of configuration files
      var configs = fs.readdirSync(filePath);

      //load each configuration
      configs.map(function (fileName) {

        //only attempt to load javascript files
        if( path.extname(fileName) === '.js' && fs.lstatSync(filePath + fileName).isFile() ) {
          self.load(fileName, filePath, false);

          if( fs.existsSync(filePath + 'env/' + self.env.get() + '/' + fileName) ) {
            self.load(fileName, filePath + 'env/' + self.env.get() + '/');
          }

        }

      });
    }

  },

  load: function(fileName, filePath, required, name) {

    var fileNameParts = fileName.split('.');

    //determine filename and name to use as the reference
    if( fileNameParts.length > 1 ) {
      name = name || fileNameParts[0];
    } else {
      name = name || fileName;
      filename = fileName + '.js';
    }

    //attempt to load the configuration
    if( fs.existsSync(filePath + fileName) ) {

      if( typeof global.ouro.config[name] === 'object' ) {
        global.ouro.config[name] = merge(require(filePath + fileName), global.ouro.config[name]);
      } else {
        global.ouro.config[name] = require(filePath + fileName);
      }

    } else if( required ) {
      throw new Ouro.Error('missing_configuration', 'The ' + name + ' configuration is required (' + filePath + fileName + ').');
    }

  },

  get: function(name) {
    if( typeof global.ouro.config[name] === 'object' ) {
      return global.ouro.config[name];
    } else {
      return undefined;
    }
  }

});
