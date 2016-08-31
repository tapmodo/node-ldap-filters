node-ldap-filters
=================

**Build, generate, parse, and evaluate LDAP filters**

[![Build Status](https://travis-ci.org/tapmodo/node-ldap-filters.svg?branch=master)](https://travis-ci.org/tapmodo/node-ldap-filters)

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
  * **.raw(value)** - add an raw (escaped) attribute value `(attr=value)`

**Added in 2.x** The `.raw` method is useful for building filters that
have complex substring matches not suitable for `.startsWith()`,
`.endsWith()`, or `.contains()` — however, you will need to escape
any values that require escaping. This can be done using
`Filter.escape()` like so:

```javascript
var match_value = '*' + Filter.escape('James (Jimmy)') + '*';
var filter = Filter.attribute('cn').raw(match_value);

match_value == '*James \\28Jimmy\\29*' // true
```

#### Logical/Aggregate methods

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

### Simplify a filter

The `.simplify()` method will reduce any AND or OR filters that have only
one child/condition and replace them with that filter. NOT filters, and
any other filters will remain intact.

```javascript
var input = '(&(uid=jenny))';
Filter.parse(input).simplify().toString() // => '(uid=jenny)'
```

### Output/print

Whether you've created a filter programatically or by parsing a filter, you
can output with `toString()` method or by concatenating with a string, like so:

    filter.toString()
    filter + ''

This will result in compacted output with no whitespace like:

    (&(givenName=jenny)(sn=jensen)(|(c=us)(st=ontario)))

If you pass a value of `true` or a numeric indentation value to
`toString()`, the output will be beautified with space indentation.

    filter.toString(true)
    filter.toString(2)

Will result in similar output to the following:

```
(&
    (givenName=jenny)
    (sn=jensen)
    (|
        (c=us)
        (st=ontario)
    )
)
```

A value of `true` will use `Filter.indent` property, which defaults to 4.
The indentation character defaults to a space, see `Filter.indent_char`

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

A complete test suite is included. To run it, you will
need to have mocha and chai installed. Mocha should be installed globally (need sudo?).

```bash
npm install -g mocha
npm install chai
```

Tests can be run from npm or manually with mocha:

```bash
# Run tests with npm
npm test

# Run tests manually
mocha test/*.js
```

## Building

The parser is built with **pegjs**. To re-build the parser,
you'll need the pegjs dev dependency installed.

```bash
# Build parser with npm
npm run build

# Build manually with pegjs
# requires pegjs command to be availble (npm i -g pegjs)
pegjs lib/parser.pegjs lib/parser.js
```

## History

**Version 1.x and lower** used jison parser source originally written by
[tantaman](https://github.com/tantaman/) found in the
[DATS-DAP](https://github.com/tantaman/DATS-DAP) repository.

**Version 2.x and above** are using an updated original pegjs-based parser.
This version offers better RFC-compliance and improved matching for
complicated substring matches and escaped characters, as well as addressing
some bugs found in the previous jison parser.
