var soundex = require('soundex');

/** Base Filter Constructor **/
var Filter = function(attrib,comp,value){
  this.type = 'filter';
  this.attrib = attrib;
  this.comp = comp;
  this.value = value;
};

Filter.prototype = {
  match: function(data){
    var value = this.value;
    var attrv = data[this.attrib];

    switch(this.comp){
      case '=':
        if ((value == '*') && attrv) return true;
        else return Filter.matchString(attrv,value);
      case '<=':
        return Filter.matchLTE(attrv,value);
      case '>=':
        return Filter.matchGTE(attrv,value);
      case '~=':
        return Filter.matchApprox(attrv,value);
      default:
        throw new Error('Unknown comparison type');
    }
  },
  _indent: function(indent,level,id_char){
    var _i = parseInt(indent);
    if (indent === true) indent = Filter.indent;
      else if (!isNaN(_i)) indent = _i;
      else return '';

    if ((id_char !== undefined) && (typeof id_char != 'string'))
      throw new Error('Indent string must be string');

    level = level || 0;
    id_char = id_char || Filter.indent_char;

    return id_char.repeat(level*indent);
  },
  toString: function(indent,level,id_char) {
    return [
      this._indent(indent,level,id_char),
      '(', this.attrib, this.comp, this.value, ')'
    ].join('');
  }
};

/* A list of characters that need escaping */
Filter.escapeChars = [ '*', '(', ')', '\\', String.fromCharCode(0) ];

/* Default indent and character for beautify */
Filter.indent = 4;
Filter.indent_char = ' ';
Filter.collapse_not = true;

/* Escape a string value */
Filter.escape = function(value){
  var rv = [];
  if (!value) return '';

  return value.split('').map(function(c){
    return(Filter.escapeChars.indexOf(c) >= 0)?
      '\\'+c.charCodeAt(0).toString(16): c
  }).join('');
};

/* Unescape an escaped string value */
Filter.unescape = function(data) {
  var chars = data.split('');
  var out = [];
  var tmp;

  while(chars.length){
    tmp = chars.shift();

    if (tmp == '\\') {
      tmp = chars.shift() + chars.shift();
      tmp = parseInt(tmp,16);
      tmp = String.fromCharCode(tmp);
    }
    out.push(tmp);
  }

  return out.join('');
};

Filter.matchString = function(data,filter){
  if (!data) return false;
  var match = Array.isArray(data)? data: [ data ];
  if (filter.indexOf('*')<0) {
    return match.some(function(cv){
      if (cv) return cv.toLowerCase() == Filter.unescape(filter).toLowerCase();
    });
  }
  return Filter.matchSubstring(data,filter);
};

Filter.matchSubstring = function(data,filter){
  var match = Array.isArray(data)? data: [ data ];
  var pattern = filter.replace(/\*/g,'.*');
  var regex = new RegExp('^'+pattern+'$','i');
  return match.some(function(cv){
    return Filter.escape(cv).match(regex);
  });
};

Filter.matchApprox = function(data,filter){
  var match = Array.isArray(data)? data: [ data ];
  return match.some(function(cv){
    return soundex(cv,true) == soundex(filter,true);
  });
};

Filter.matchLTE = function(data,filter){
  var match = Array.isArray(data)? data: [ data ];
  return match.some(function(cv){
    return cv <= filter;
  });
};

Filter.matchGTE = function(data,filter){
  var match = Array.isArray(data)? data: [ data ];
  return match.some(function(cv){
    return cv >= filter;
  });
};

Filter.AND = function(filters){
  return new GroupAnd(filters);
};

Filter.OR = function(filters){
  return new GroupOr(filters);
};

Filter.NOT = function(filter){
  if (!Array.isArray(filter)) filter = [ filter ];
  if (filter.length != 1) throw new Error('NOT must wrap single filter');
  return new GroupNot(filter);
};

/** Grouping Constructor **/
var Group = function(comp,filters) {
  this.type = 'group';
  this.comp = comp;
  this.filters = filters;
};

Group.prototype = Object.create(Filter.prototype);
Group.prototype.match = function(data){
  return this._match(data);
};
Group.prototype.toString = function(indent,level,id_char){
  level = level || 0;
  var id_str = this._indent(indent,level,id_char);
  var id_str2 = id_str;
  var nl = indent? '\n': '';

  if (Filter.collapse_not && (this.comp == '!'))
    nl = '', id_str2 = '', indent = 0;

  return [
    id_str, '(', this.comp, nl, this.filters.map(function(item){
      return item.toString(indent,level+1,id_char)
    }).join(nl), nl, id_str2, ')'
  ].join('');
};

var GroupOr = function(filters) {
  this.type = 'group';
  this.comp = '|';
  this.filters = filters;
};
GroupOr.prototype = Object.create(Group.prototype);
GroupOr.prototype._match = function(data){
  return this.filters.some(function(cv,idx,all){
    return cv.match(data);
  });
};

var GroupAnd = function(filters) {
  this.type = 'group';
  this.comp = '&';
  this.filters = filters;
};
GroupAnd.prototype = Object.create(Group.prototype);
GroupAnd.prototype._match = function(data){
  return this.filters.every(function(cv,idx,all){
    return cv.match(data);
  });
};

var GroupNot = function(filters) {
  this.type = 'group';
  this.comp = '!';
  this.filters = filters;
};
GroupNot.prototype = Object.create(Group.prototype);
GroupNot.prototype._match = function(data){
  return this.filters.every(function(cv,idx,all){
    if (cv && (typeof cv.match == 'function')) return !!!cv.match(data);
  });
};

/** Attribute Constructor **/
var Attribute = function(name) {
  this.name = name;
};

Attribute.prototype = {
  present: function() {
    return new Filter(this.name,'=','*');
  },
  raw: function(value) {
    return new Filter(this.name,'=',value);
  },
  equalTo: function(value) {
    return new Filter(this.name,'=',this.escape(value));
  },
  endsWith: function(value) {
    return new Filter(this.name,'=','*'+this.escape(value));
  },
  startsWith: function(value) {
    return new Filter(this.name,'=',this.escape(value)+'*');
  },
  contains: function(value) {
    return new Filter(this.name,'=','*'+this.escape(value)+'*');
  },
  approx: function(value) {
    return new Filter(this.name,'~=',this.escape(value));
  },
  lte: function(value) {
    return new Filter(this.name,'<=',this.escape(value));
  },
  gte: function(value) {
    return new Filter(this.name,'>=',this.escape(value));
  },
  escapeChars: [ '*', '(', ')', '\\', String.fromCharCode(0) ],
  escape: function(value){
    if (typeof value == 'number') value += '';
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

module.exports = Filter;

