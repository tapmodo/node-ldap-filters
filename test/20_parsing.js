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

  it('parses a funny character value',function(done){
    var filter = '(orgUnit=%)';
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

  it('matching against parsed filter',function(done){
    // Test for a match
    var filter = '(&(sn=jensen)(gn=jenny))';
    var parsed = Filter.parse(filter);
    var data = { sn: 'Jensen', gn: 'Jenny' };
    expect(parsed.match(data)).to.be.true;

    // Non-match
    data = { sn: 'Jensen' };
    expect(parsed.match(data)).to.be.false;

    done();
  });

  it('fails on incorrectly formed filter',function(done){
    var filter = '(sn=smith';
    assert.throws(function(){Filter.parse(filter);}, Error);
    done();
  });

  /* Issue #1 */
  it('parses substring matches beginning with asterisk',function(done){
    var filter = '(sn=*smith*)';
    var parsed = Filter.parse(filter);
    parsed.type.should.equal('filter');
    parsed.attrib.should.equal('sn');
    parsed.comp.should.equal('=');
    parsed.value.should.equal('*smith*');
    done();
  });

  it('fails on incorrect format past first correct filter parse',function(done){
    var filter = '(&(sn=smith))\n(uuid=3) f';
    assert.throws(function(){Filter.parse(filter);}, Error);
    done();
  });

  it('allows whitespace',function(done){
    var filter = ' (&  (sn=smith) \n )  ';
    Filter.parse(filter).toString().should.be.equal('(&(sn=smith))');
    done();
  });

  it('parses a single filter without parenthesis',function(done){
    var filter = 'sn=smith';
    Filter.parse(filter).toString().should.be.equal('(sn=smith)');
    done();
  });

  it('allows whitespace on single filter without parenthesis',function(done){
    var filter = '\n sn=smith ';
    Filter.parse(filter).toString().should.be.equal('(sn=smith)');
    done();
  });

});

