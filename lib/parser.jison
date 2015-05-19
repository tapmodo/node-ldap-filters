/**
* @author Matt Crinklaw-Vogt
*/

%lex

%{

%}

%s VALUE ATTR

%%

<INITIAL>\s+			/**/
<INITIAL>"("			%{
    var upcoming = this.upcomingInput();
    switch (upcoming[1]) {
      case '&':
      case '|':
      case '!':
        break;

      default:
        this.begin("ATTR");
        break;
    }
    return "LEFT_PAREN";
  %}
<INITIAL>")"			return "RIGHT_PAREN";
<INITIAL>"&"			return "AND";
<INITIAL>"|"			return "OR";
<INITIAL>"!"			return "NOT";
<INITIAL>"=*"			return "EQ_STAR";
<INITIAL>"~="			this.begin("VALUE"); return "APPROX";
<INITIAL>">="			this.begin("VALUE"); return "GREATER_EQ";
<INITIAL>"<="			this.begin("VALUE"); return "LESS_EQ";
<INITIAL>"="			this.begin("VALUE"); return "EQUAL";
<INITIAL>"*"			return "STAR";

<VALUE>[^\\()]+			return "VALUE_STR";
<VALUE>"\\("			return "VALUE_STR";
<VALUE>"\\)"			return "VALUE_STR";
<VALUE>"\\\\"			return "VALUE_STR";
<VALUE>"\\*"			return "VALUE_STR";
<VALUE>")"				this.popState(); return "RIGHT_PAREN";

<ATTR>[^=><~()]+		this.popState(); return "ATTR_STR";

/lex

%{
  var Filter = require('./filter');
%}

%%

done
	: filter
		{
      return $1;
		}
	;

filter
	: LEFT_PAREN filter_comp RIGHT_PAREN
		{
			$$ = $2;
		}
	;

filter_comp
	: and
		{ 
			$$ = $1;
		}
	| or
		{ 
			$$ = $1;
		}
	| not
		{ 
			$$ = $1;
		}
	| operation
		{ 
			$$ = $1;
		}
	;

and
	: AND filter_list
		{ 
      $$ = Filter.AND($2);
		}
	;

or
	: OR filter_list
		{
      $$ = Filter.OR($2);
		}
	;

not
	: NOT filter
		{
      $$ = Filter.NOT($2);
		}
	;

filter_list
	: filter
		{
			$$ = [ $1 ];
		}
	| filter filter_list
		{
      $2.unshift($1);
			$$ = $2;
		}
	;

operation
	: some_op
		{
			$$ = $1;
		}
	| present
		{
			$$ = $1;
		}
	;

some_op
	: ATTR_STR filter_type value_str
		{
      $$ = new Filter($1,$2,$3);
		}
	| ATTR_STR filter_type_ambiguous value_str  /* This could be equal or substring */
		{
      $$ = new Filter($1,$2,$3);
		}
	;

filter_type
	: APPROX
		{
			$$ = '~=';
		}
	| GREATER_EQ
		{
			$$ = '>=';
		}
	| LESS_EQ
		{
			$$ = '<=';
		}
	;

filter_type_ambiguous
	: EQUAL
		{
			$$ = '=';
		}
	;

present
	: ATTR_STR EQ_STAR
		{
      $$ = Filter.attribute($1).present();
		}
	;

value_str
	: VALUE_STR
		{
			$$ = $1;
		}
	| value_str VALUE_STR
		{
			$$ = $1 + $2;
		}
	;
