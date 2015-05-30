var should = require('chai').should();
var Filter = require('../index');
var expect = require('chai').expect;

describe('Matching',function(){
  
  it('simple equality',function(done){
    var filter = Filter.attribute('sn').equalTo('smith');
    expect(filter.match({sn:'smith'})).to.be.true;
    expect(filter.match({sn:'SMITH'})).to.be.true;
    expect(filter.match({sn:'jones'})).to.be.false;
    done();
  });

  it('multi-valued keys',function(done){
    var filter = Filter.attribute('gn').equalTo('rick');
    var data = { gn: [ 'Richard', 'Dick', 'Rick', 'Ricky' ] };
    expect(filter.match(data)).to.be.true;
    data = { gn: [ 'Thomas', 'Tom' ] };
    expect(filter.match(data)).to.be.false;
    done();
  });

  it('attribute presense',function(done){
    var filter = Filter.attribute('sn').present();
    expect(filter.match({sn:'smith'})).to.be.true;
    expect(filter.match({sn:'jones'})).to.be.true;
    expect(filter.match({gn:'jim'})).to.be.false;
    done();
  });

  it('attribute contains value',function(done){
    var filter = Filter.attribute('sn').contains('smith');
    expect(filter.match({sn:'smith'})).to.be.true;
    expect(filter.match({sn:'smith-jones'})).to.be.true;
    expect(filter.match({sn:'McSmithers'})).to.be.true;
    expect(filter.match({sn:'Jones'})).to.be.false;
    done();
  });

  it('attribute ends with value',function(done){
    var filter = Filter.attribute('sn').endsWith('smith');
    expect(filter.match({sn:'Smith'})).to.be.true;
    expect(filter.match({sn:'Jones-Smith'})).to.be.true;
    expect(filter.match({sn:'Jensen-Smith-Jones'})).to.be.false;
    done();
  });

  it('attribute starts with value',function(done){
    var filter = Filter.attribute('sn').startsWith('smith');
    expect(filter.match({sn:'Smith'})).to.be.true;
    expect(filter.match({sn:'Smith-Jones'})).to.be.true;
    expect(filter.match({sn:'Jones-Smith-Jensen'})).to.be.false;
    done();
  });

  it ('attribute greater than or equal',function(done){

    // Numeric
    var filter = Filter.attribute('age').gte('5');
    expect(filter.match({age:4})).to.be.false;
    expect(filter.match({age:'4'})).to.be.false;
    expect(filter.match({age:5})).to.be.true;
    expect(filter.match({age:'5'})).to.be.true;
    expect(filter.match({age:6})).to.be.true;
    expect(filter.match({age:'6'})).to.be.true;
    expect(filter.match({})).to.be.false;

    // Lexical
    filter = Filter.attribute('sn').gte('bell');
    expect(filter.match({sn:'ace'})).to.be.false;
    expect(filter.match({sn:'bell'})).to.be.true;
    expect(filter.match({sn:'call'})).to.be.true;

    done();
  });

  it ('attribute less than or equal',function(done){

    // Numeric
    var filter = Filter.attribute('age').lte('5');
    expect(filter.match({age:5})).to.be.true;
    expect(filter.match({age:'5'})).to.be.true;
    expect(filter.match({age:6})).to.be.false;
    expect(filter.match({age:'6'})).to.be.false;
    expect(filter.match({age:'4'})).to.be.true;
    expect(filter.match({age:4})).to.be.true;
    expect(filter.match({})).to.be.false;

    // Lexical
    filter = Filter.attribute('sn').lte('bell');
    expect(filter.match({sn:'ace'})).to.be.true;
    expect(filter.match({sn:'bell'})).to.be.true;
    expect(filter.match({sn:'call'})).to.be.false;

    done();
  });

  it('basic approx test ("sounds like")',function(done){
    var filter = Filter.attribute('gn').approx('jenny');
    expect(filter.match({gn:'Jeni'})).to.be.true;
    expect(filter.match({gn:'Jenney'})).to.be.true;
    expect(filter.match({gn:'Ricky'})).to.be.false;
    done();
  });

  it('aggregate AND',function(done){
    var filter = Filter.AND([
      Filter.attribute('gn').equalTo('jenny'),
      Filter.attribute('sn').startsWith('jensen')
    ]);
    expect(filter.match({gn:'Jenny',sn:'Jensen'})).to.be.true;
    expect(filter.match({gn:'Jenny',sn:'Jensen-Smith'})).to.be.true;
    expect(filter.match({gn:'Jerry',sn:'Jensen'})).to.be.false;
    expect(filter.match({sn:'Jensen'})).to.be.false;
    done();
  });

  it('aggregate OR',function(done){
    var filter = Filter.OR([
      Filter.attribute('gn').equalTo('jenny'),
      Filter.attribute('sn').startsWith('jensen')
    ]);
    expect(filter.match({gn:'Jenny',sn:'Jensen'})).to.be.true;
    expect(filter.match({gn:'Jenny'})).to.be.true;
    expect(filter.match({sn:'Jensen'})).to.be.true;
    expect(filter.match({gn:'Jerry',sn:'Jones'})).to.be.false;
    expect(filter.match({})).to.be.false;
    done();
  });

  it('negation (NOT)',function(done){
    var filter = Filter.NOT(
      Filter.attribute('sn').equalTo('jensen')
    );
    expect(filter.match({sn:'Jensen'})).to.be.false;
    expect(filter.match({sn:'Jones'})).to.be.true;
    expect(filter.match({})).to.be.true;
    done();
  });

  it('values that require escaping',function(done){
    var filter = Filter.attribute('info').equalTo('*(test)*');
    expect(filter.match({info:'*(test)*'})).to.be.true;
    expect(filter.match({info:'(test)'})).to.be.false;
    expect(filter.match({})).to.be.false;
    done();
  });

  it('complex filter and object match',function(done){
    var filter = Filter.AND([
      Filter.attribute('active').equalTo('1'),
      Filter.NOT(
        Filter.attribute('objectClass').equalTo('inetMailObject')
      ),
      Filter.OR([
        Filter.attribute('gn').equalTo('jenny'),
        Filter.attribute('sn').startsWith('jensen')
      ])
    ]);

    var data = { active: '1', gn: 'jenny' };
    expect(filter.match(data)).to.be.true;

    data.objectClass = [ 'person' ];
    expect(filter.match(data)).to.be.true;

    data.objectClass = [ 'person', 'inetMailObject' ];
    expect(filter.match(data)).to.be.false;

    expect(filter.match({})).to.be.false;

    done();
  });

});

