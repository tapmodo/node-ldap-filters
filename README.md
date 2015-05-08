node-ldap-filters
=================

**Build, generate, parse, and evaluate LDAP filters**

### Installation

Use npm:

    npm install ldap-filters

### Build a filter (programatically)

```javascript
var Filter = require('ldap-filters');

var output = Filter.AND([
  Filter.attribute('givenName').equalTo('jenny'),
  Filter.attribute('sn').equalTo('jensen')
]);

console.log(output.toString());
```

### Parse a filter

```javascript
var Filter = require('ldap-filters');
var input = '(&(givenName=jenny)(sn=jensen))';

Filter.parse(input);
```

### Evaluate data against a filter

```javascript
var Filter = require('ldap-filters');
var input = '(&(givenName~=jeni)(sn=jensen))';
var parsed = Filter.parse(input);

var data = { givenName: 'Jenny', sn: 'Jensen' };
console.log(parsed.match(data));
```


