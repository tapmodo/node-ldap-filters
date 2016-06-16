var should = require('chai').should();
var expect = require('chai').expect;
var Filter = require('../index');
var assert = require('chai').assert;

describe('Output',function(){
  var input = '(&(givenName=jenny)(sn=jensen)(|(c=us)(st=ontario)))';
  var parsed = Filter.parse(input);

  it('basic output toString()',function(done){
    parsed.toString().should.be.equal('(&(givenName=jenny)(sn=jensen)(|(c=us)(st=ontario)))');
    done();
  });

  it('basic output string concatenation',function(done){
    (parsed+'').should.be.equal('(&(givenName=jenny)(sn=jensen)(|(c=us)(st=ontario)))');
    done();
  });

  it('beautifies with default indentation',function(done){
    Filter.indent = 4;
    parsed.toString(true).should.be.equal(
      '(&\n    (givenName=jenny)\n    (sn=jensen)\n    (|\n        (c=us)\n        (st=ontario)\n    )\n)'
    );
    done();
  });

  it('beautifies with specified indent',function(done){
    parsed.toString(2).should.be.equal(
      '(&\n  (givenName=jenny)\n  (sn=jensen)\n  (|\n    (c=us)\n    (st=ontario)\n  )\n)'
    );
    done();
  });

  it('indents with custom string',function(done){
    parsed.toString(2,null,'\t').should.be.equal(
      '(&\n\t\t(givenName=jenny)\n\t\t(sn=jensen)\n\t\t(|\n\t\t\t\t(c=us)\n\t\t\t\t(st=ontario)\n\t\t)\n)'
    );
    done();
  });

  it('indents with custom string (global setting)',function(done){
    var old = Filter.indent_char;
    Filter.indent_char = '\t';
    parsed.toString(2).should.be.equal(
      '(&\n\t\t(givenName=jenny)\n\t\t(sn=jensen)\n\t\t(|\n\t\t\t\t(c=us)\n\t\t\t\t(st=ontario)\n\t\t)\n)'
    );
    Filter.indent_char = old;
    done();
  });

  it('fails if indent string not a string',function(done){
    assert.throws(function(){
      parsed.toString(2,null,1);
    }, Error);
    done();
  });

  it('respects collapse_not setting');

});

