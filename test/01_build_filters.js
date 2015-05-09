var should = require('chai').should();
var Filter = require('../index');

describe('Building filters',function(){

  it('builds a presence filter',function(done){
    var out = Filter.attribute('sn').present().toString();
    out.should.be.equal('(sn=*)');
    done();
  });

  it('builds an equality filter',function(done){
    var out = Filter.attribute('sn').equalTo('Jones').toString();
    out.should.be.equal('(sn=Jones)');
    done();
  });

  it('builds an ends with filter',function(done){
    var out = Filter.attribute('sn').endsWith('jones').toString();
    out.should.be.equal('(sn=*jones)');
    done();
  });

  it('builds an starts with filter',function(done){
    var out = Filter.attribute('sn').startsWith('jones').toString();
    out.should.be.equal('(sn=jones*)');
    done();
  });

  it('builds a contains filter',function(done){
    var out = Filter.attribute('sn').contains('jones').toString();
    out.should.be.equal('(sn=*jones*)');
    done();
  });

  it('builds an approximate filter',function(done){
    var out = Filter.attribute('sn').approx('jones').toString();
    out.should.be.equal('(sn~=jones)');
    done();
  });

  it('builds an less than or equal filter',function(done){
    var out = Filter.attribute('sn').lte('smith').toString();
    out.should.be.equal('(sn<=smith)');
    done();
  });

  it('builds an greater than or equal filter',function(done){
    var out = Filter.attribute('sn').gte('smith').toString();
    out.should.be.equal('(sn>=smith)');
    done();
  });

  it('converts number values to strings',function(done){
    var out = Filter.attribute('age').equalTo(1000).toString();
    out.should.be.equal('(age=1000)');
    done();
  });

  it('properly escapes values',function(done){
    var out = Filter.attribute('description').equalTo('a * (complex) \\value').toString();
    out.should.be.equal('(description=a \\2a \\28complex\\29 \\5cvalue)');
    done();
  });

});
