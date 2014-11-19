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

/** Parser Constructor **/

var Parser = function(input){
  this.input = input;
  this.stack = [];
  this.filters = [];
};

Parser.prototype = {
  chomp: function(range){
    var tmp = this.input.split('');
    var len = range[1] - range[0] + 1;
    var args = (new Array(len+1)).join(' ').split('');
    args.unshift(range[0],len);
    var rv = Array.prototype.splice.apply(tmp,args).join('');
    this.input = tmp.join('');
    return rv;
  },
  inspectTopRange: function(){
    if (this.filters.length)
      return this.filters[this.filters.length-1];
  },
  parseFilter: function(data){
    var match = data.match(/\(([a-zA-Z0-9]+)(=|<=|>=|~=)(.*?)\)/)
    if (match) return new Filter(match[1],match[2],match[3]);
    throw new Error("Could not parse filter segment: "+data);
  },
  topRangeInside: function(range){
    var tr = this.inspectTopRange();
    if (tr) return ((tr[0] > range[0]) && (tr[1] < range[1]));
  },
  foundFilter: function(range){
    var inner = [], self = this;

    while(this.topRangeInside(range))
      inner.unshift(this.filters.pop());

    var data = {
      0: range[0],
      1: range[1],
      type: null,
      content: inner.length? inner: self.parseFilter(self.chomp(range))
    };

    this.filters.push(data);
    if (inner.length) data.type = self.chomp(range)[1];
  },
  parse: function(){
    for(var i=0,f=this.input,l=f.length; i<l; i++){
      if (f[i] == '(') {
        //console.log('Found open paren  @ %d',i);
        this.stack.push(i);
      }
      else if (f[i] == ')') {
        //console.log('Found close paren @ %d',i);
        this.foundFilter([ this.stack.pop(), i ]);
      }
    }
    for(i=0,s=this.filters,l=s.length; i<l; i++){
      //console.log('Stack: %d, %d', s[i][0], s[i][1]);
      //console.log(f.substr(s[i][0],s[i][1] - s[i][0] + 1));
    }

    if (!this.filters.length == 1)
      throw new Error('Filter parse error');

    return this.recurseParse(this.filters.shift());
  },
  type_map: {
    '&': 'AND',
    '|': 'OR',
    '!': 'NOT'
  },
  recurseParse: function(data){
    if (!data.type) return data.content;
    return Filter[this.type_map[data.type]](data.content.map(this.recurseParse.bind(this)));
  }
};

Filter.attribute = function(name) {
  return new Attribute(name);
};

Filter.parse = function(input){
  return (new Parser(input)).parse();
};

module.exports = Filter;

