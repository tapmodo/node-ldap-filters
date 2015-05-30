var should = require('chai').should();
var expect = require('chai').expect;
var Filter = require('../index');
var assert = require('chai').assert;

describe('Parsing',function(){

  // To test the parsing, a correctly written filter is parsed and
  // written back to a string, then compared to the original input.
  // While this is probably a good way to test correct parsing, it
  // doesn't test that the parsed object is exactly what is expected.
  // I've concluded this type of problem is the bane of unit testing.
  it('parse small filter',function(done){
    var filter = '(sn=smith)';
    var parsed = Filter.parse(filter);
    parsed.toString().should.be.equal(filter);
    done();
  });

  it('parse more complex filter',function(done){
    var filter = '(&(sn=smith)(gn=john)(!(age=5)))';
    var parsed = Filter.parse(filter);
    parsed.toString().should.be.equal(filter);
    done();
  });

  it('perform a match against a parsed filter',function(done){
    var filter = '(&(sn=jensen)(gn=jenny))';
    var parsed = Filter.parse(filter);
    var data = { sn: 'Jensen', gn: 'Jenny' };
    expect(parsed.match(data)).to.be.true;
    done();
  });

  it('non-matching data does not match parsed filter',function(done){
    var filter = '(&(sn=jensen)(gn=jenny))';
    var parsed = Filter.parse(filter);
    var data = { sn: 'Jensen' };
    expect(parsed.match(data)).to.be.false;
    done();
  });

  it('fails on incorrectly formed filter',function(done){
    var filter = '(sn=smith';
    assert.throws(function(){Filter.parse(filter);}, Error);
    done();
  });

});

