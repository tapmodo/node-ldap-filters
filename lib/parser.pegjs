// A peg.js grammar for parsing LDIF based on RFC2849
// @author Kelly Hallman <khallman@tapmodo.com>
// @copyright 2015 Tapmodo Interactive LLC
// @license MIT

//-------------------------------------------------------
// JAVASCRIPT INITIALIZATION ----------------------------
// This scope will be available to the parser

{
  var fs = require('fs');
  var Filter = require('./filter');
  
  function base64_decode(val){
    return (new Buffer(val,'base64')).toString();
  }

  var _pluck = function(list,attr){
    return list.map(function(cv){
      return cv[attr];
    });
  };
}

//-------------------------------------------------------
// INITIAL PARSING RULE ---------------------------------
// Since it's the first rule, it will start the parsing

start
  = filter:filter { return filter; }

filter
  = FILL* '(' filter:filtercomp ')' FILL* { return filter; }

filtercomp
  = and / or / not / item

and
  = '&' FILL* filters:filterlist FILL* { return Filter.AND(filters); }

or
  = '|' FILL* filters:filterlist FILL* { return Filter.OR(filters); }

not
  = '!' FILL* filter:filter FILL* { return Filter.NOT(filter); }

filterlist
  = filter+

item
  = substring / simple / present

//= simple / present / substring / extensible

simple
  = attr:attr comp:filtertype value:value { return new Filter(attr.attribute,comp,value); }

filtertype
  = equal / approx / greater / less

equal
  = '='

approx
  = '~='

greater
  = '>='

less
  = '<='

present
  = attr:attr '=*' { return Filter.attribute(attr.attribute).present(); }

substring
  = attr:attr equal value:$(initial:value? any:any final:value?) {
    return new Filter(attr.attribute,'=',value);
  }

any
  = $ '*' (value '*')*

attr
  = AttributeDescription

value
  = $ AttributeValue+

//-------------------------------------------------------
// ATTRIBUTE DESCRIPTION --------------------------------
// A fully compliant match of attributes with options

AttributeDescription "attribute description"
  = attr:AttributeType opts:(";" options)? {
    if (opts) {
      opts.shift();
      opts = opts.shift();
      opts = opts.split(';');
    }
    attr.options = opts || [];
    return attr;
  }

AttributeType "attribute Type"
  = oid:LDAP_OID {
    return {
      type: 'oid',
      attribute: oid
    };
  }
  / name:$(ALPHA AttrTypeChars*) {
    return {
      type: 'attribute',
      attribute: name
    };
  }

AttrTypeChars "attribute type chars"
  = ALPHA / DIGIT / "-"

LDAP_OID "OID"
  = $ (DIGIT+ ("." DIGIT+)*)

//-------------------------------------------------------
// ATTRIBUTE OPTIONS ------------------------------------
// These are somewhat rare, but in the spec

options "attribute options"
  = $ (option ";" options)
  / $ option

option "attribute option"
  = (AttrTypeChars+)

//-------------------------------------------------------
// VALUE SPECIFICATIONS ---------------------------------
// Specifying values and continuation lines

value_spec "attribute value"
  = left:SAFE_STRING SEP SPACE right:value_recurse { return left + right; }
  / $ SAFE_STRING

value_recurse "continuation"
  = left:$SAFE_CHAR+ SEP SPACE right:value_recurse { return left + right; }
  / $ SAFE_CHAR+

base64_value_spec "base64-encoded value"
  = left:BASE64_STRING SEP SPACE right:base64_value_spec { return left + right; }
  / $ BASE64_STRING

//-------------------------------------------------------
// AGGREGATES AND HELPERS -------------------------------
// Base types, character classes, and aggregates

AttributeValue
  = EscapedCharacter / SPACE / DIGIT / ALPHA

EscapedCharacter
  = '\\' char:ASCII_VALUE { return String.fromCharCode(char); }

ASCII_VALUE
  = value:$(HEX_CHAR HEX_CHAR) { return parseInt(value,16); }

HEX_CHAR
  = [a-fA-F0-9]

FILL "FILL"
  = SPACE / TAB / SEP

SPACE "SPACE"
  = [\x20]

TAB "TAB"
  = [\x09]

DIGIT "DIGIT"
  = $ [0-9]

ALPHA "ALPHA"
  = $ [a-zA-Z]

BASE64_STRING "BASE64 STRING"
  = $ BASE64_CHAR*

BASE64_CHAR "BASE64 CHAR"
  = $ [\x2B\x2F\x30-\x39\x3D\x41-\x5A\x61-\x7A]

SAFE_STRING "SAFE STRING"
  = $(SAFE_INIT_CHAR SAFE_CHAR*)

SAFE_INIT_CHAR "SAFE INITIALIZER"
  = $ [\x01-\x09\x0B-\x0C\x0E-\x1F\x21-\x39\x3B\x3D-\x7F]

SAFE_CHAR "SAFE CHAR"
  = $ [\x01-\x09\x0B-\x0C\x0E-\x7F]

SEP "NEWLINE"
  = "\r\n"
  / "\n"

