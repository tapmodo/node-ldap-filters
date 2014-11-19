/** Base Filter Constructor **/
var Filter = function(attrib,comp,value){
  this.type = 'filter';
  this.attrib = attrib;
  this.comp = comp;
  this.value = value;
};

Filter.prototype = {
  toString: function() {
    return [ '(', this.attrib, this.comp, this.value, ')' ].join('');
  }
};

Filter.AND = function(filters){
  return new Group('&',filters);
};

Filter.OR = function(filters){
  return new Group('|',filters);
};

Filter.NOT = function(filter){
  if (!Array.isArray(filter)) filter = [ filter ];
  if (filter.length != 1) throw new Error('NOT must wrap single filter');
  return new Group('!',filter);
};

/** Grouping Constructor **/
var Group = function(comp,filters) {
  this.type = 'group';
  this.comp = comp;
  this.filters = filters;
};

Group.prototype = {
  toString: function(){
    return '(' + this.comp + this.filters.join('') + ')';
  }
};

/** Attribute Constructor **/
var Attribute = function(name) {
  this.name = name;
};

Attribute.prototype = {
  isPresent: function() {
    return new Filter(this.name,'=','*');
  },
  isEqualTo: function(value) {
    return new Filter(this.name,'=',this.escape(value));
  },
  escapeChars: [ '*', '(', ')', '\\', String.fromCharCode(0) ],
  escape: function(value){
    var rv = [];
    for(var i=0,l=value.length; i<l; i++){
      rv.push(
        (this.escapeChars.indexOf(value[i]) >= 0)?
        '\\'+value.charCodeAt(i).toString(16): value[i]
      );
    }
    return rv.join('');
  }
};

Filter.attribute = function(name) {
  return new Attribute(name);
};

Filter.parse = function(input){
  return Parser.parse(input);
};

module.exports = Filter;

