var should = require('chai').should();
var Filter = require('../index');

describe('Aggregate filters',function(){

  it('AND filters',function(done){
    var out = Filter.AND([
      Filter.attribute('givenName').equalTo('jenny'),
      Filter.attribute('sn').equalTo('jensen')
    ]).toString();

    out.should.be.equal('(&(givenName=jenny)(sn=jensen))');
    done();
  });

  it('OR filters',function(done){
    var out = Filter.OR([
      Filter.attribute('givenName').equalTo('jenny'),
      Filter.attribute('sn').equalTo('jensen')
    ]).toString();

    out.should.be.equal('(|(givenName=jenny)(sn=jensen))');
    done();
  });

  it('NOT filter',function(done){
    var out = Filter.NOT([
      Filter.attribute('sn').equalTo('jensen')
    ]).toString();

    out.should.be.equal('(!(sn=jensen))');
    done();
  });

});
