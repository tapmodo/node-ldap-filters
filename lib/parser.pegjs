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
  / FILL* filter:item {
    filter.value = filter.value.replace(/ +$/,'');
    return filter;
  }

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

// item should allow "extensible" filters
//= simple / present / substring / extensible

item
  = substring / simple / present

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
// AGGREGATES AND HELPERS -------------------------------
// Base types, character classes, and aggregates

AttributeValue
  = EscapedCharacter / [^\x29]

EscapedCharacter
  = '\\' char:ASCII_VALUE { return String.fromCharCode(char); }

ASCII_VALUE
  = value:$(HEX_CHAR HEX_CHAR) { return parseInt(value,16); }

HEX_CHAR
  = [a-fA-F0-9]

FILL "WHITESPACE"
  = SPACE / TAB / SEP

SPACE "SPACE"
  = [\x20]

TAB "TAB"
  = [\x09]

DIGIT "DIGIT"
  = $ [0-9]

ALPHA "ALPHA"
  = $ [a-zA-Z]

SEP "NEWLINE"
  = "\r\n"
  / "\n"

