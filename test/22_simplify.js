var should = require('chai').should();
var expect = require('chai').expect;
var Filter = require('../index');
var assert = require('chai').assert;

describe('Simplify',function(){

  it('does not simplify what it shouldn\'t',function(done){
    var input = '(&(givenName=jenny)(sn=jensen)(|(c=us)(st=ontario)))';
    var parsed = Filter.parse(input);
    parsed.toString().should.be.equal(input);
    done();
  });

  it('does simplify what it should',function(done){
    var input = '(&(givenName=jenny)(sn=jensen)(|(!(c=us))(st=ontario)))';
    var complex = '(&(|(givenName=jenny))(&(sn=jensen))(|(!(c=us))(st=ontario)))';
    var parsed = Filter.parse(complex);
    parsed.simplify().toString().should.be.equal(input);
    done();
  });

});

