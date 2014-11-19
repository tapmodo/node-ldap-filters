var Filter = require('./filter');

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
    var match = data.match(/\(([a-zA-Z]+)(=|<=|>=|~=)(.*?)\)/)
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
      console.log(f.substr(s[i][0],s[i][1] - s[i][0] + 1));
    }
    console.log(JSON.stringify(this.filters));
    console.log(this.input);
  }
};

module.exports = Parser;
