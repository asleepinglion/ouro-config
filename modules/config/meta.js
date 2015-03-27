module.exports = {

  class: "Config",
  extends: "Class",
  description: "The Config module provides environment based configuration with deep merge support.",

  methods: {

    load: {
      description: "The load method attempts to load a specified configuration file and merge if the configuration has already been loaded."
    }
  }

};
