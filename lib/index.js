var Filter = require('./filter');
var Parser = require('./parser');

Filter.parse = function(input){
  return Parser.parse(input);
};

module.exports = Filter;

