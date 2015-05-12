node-ldap-filters
=================

**Build, generate, parse, and evaluate LDAP filters**

A library for working with Lightweight Directory Access Protocol
(LDAP) filters based on [RFC 4515](http://tools.ietf.org/html/rfc4515).

Although this format is typicaly used with the LDAP protocol, this library
could be implemented in other applications that need portable
string-based filters for the purpose of matching object data.

## Usage

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

**Note:** You must call the `.toString()` method, to obtain the filter as a string.

#### Matching methods

Various methods can be used to build simple filters:

  * **.present()** - tests for presence `(attr=*)`
  * **.equalTo(value)** - tests for equality `(attr=value)`
  * **.contains(value)** - tests if attribute contains value `(attr=*value*)`
  * **.endsWith(value)** - tests if attribute ends with value `(attr=*value)`
  * **.startsWith(value)** - tests if attribute starts with value `(attr=value*)`
  * **.approx(value)** - tests if value is approximate match `(attr~=value)`
  * **.gte(value)** - tests if value is greater than or equal `(attr>=value)`
  * **.lte(value)** - tests if value is less than or equal `(attr<=value)`

#### Aggregate methods

Simple filters can be aggregated with AND, OR, and NOT:

  * **Filter.AND(list)** - AND a list (array) of filters `(&(f1)(f2)..)`
  * **Filter.OR(list)** - OR a list (array) of filters `(|(f1)(f2)..)`
  * **Filter.NOT(filter)** - NOT (negate) a filter `(!(filter))`

Aggregation and nesting can be used to build complex filters.

### Parse a filter

Parses a filter from a string, returning a Filter object.

```javascript
var Filter = require('ldap-filters');
var input = '(&(givenName=jenny)(sn=jensen))';

Filter.parse(input);
```

### Evaluate data against a filter

Test if (object) data matches a given filter. The filter can be one
created programatically, or parsed from a text string. A boolean
`true` value will be returned for a successful match.

```javascript
var Filter = require('ldap-filters');
var input = '(&(givenName~=jeni)(sn=jensen))';
var parsed = Filter.parse(input);

var data = { givenName: 'Jenny', sn: 'Jensen' };
console.log(parsed.match(data));
```

## Unit Tests

A (currently incomplete) test suite is included. To run it, you will
need to have mocha and chai installed. Mocha should be installed globally.

```bash
npm install -g mocha
npm install chai
```

There are three ways to run the tests:

```bash
# Run tests with npm
npm test

# Run tests with "make"
make test

# Run tests manually
mocha test/*.js
```

## Building

The parser is built with **jison**. To re-build the parser,
you must have jison installed globally.

```bash
# Install jison globally
npm install -g jison

# Build with "make"
make parser

# Build manually with jison
jison lib/parser.jison -o lib/parser.js
```

## Credits

The jison parser source was originally written by
[tantaman](http://github.com/tantaman/) found in the
[DATS-DAP](/tantaman/DATS-DAP) repository.

