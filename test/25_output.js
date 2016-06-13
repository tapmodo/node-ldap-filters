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
});


