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
	var ast = require("./ast");
%}

%%

done
	: filter
		{
			ast.complete($1);
		}
	;

filter
	: LEFT_PAREN filter_comp RIGHT_PAREN
		{
			var filter = ast.createFilter($2);
			$$ = filter;
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
			var logical = ast.createLogical("and");
			logical.args = $2;
			$$ = logical;
		}
	;

or
	: OR filter_list
		{
			var logical = ast.createLogical("or");
			logical.args = $2;
			$$ = logical;
		}
	;

not
	: NOT filter
		{
			var logical = ast.createLogical("not");
			logical.args = $2;
			$$ = logical;
		}
	;

filter_list
	: filter
		{
			var filterList = ast.createFilterList($1);
			$$ = filterList;
		}
	| filter filter_list
		{
			$2.prepend($1);
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
			$2.attr = $1;
			$2.value = $3;
			$$ = $2;
		}
	| ATTR_STR filter_type_ambiguous value_str  /* This could be equal or substring */
		{
			$2.attr = $1;
			$$ = $2.setValue($3);
		}
	;

filter_type
	: APPROX
		{
			var op = ast.createOperation("approx");
			$$ = op;
		}
	| GREATER_EQ
		{
			var op = ast.createOperation("gte");
			$$ = op;
		}
	| LESS_EQ
		{
			var op = ast.createOperation("lte");
			$$ = op;
		}
	;

filter_type_ambiguous
	: EQUAL
		{
			var op = ast.createOperation("equalOrSubstr");
			$$ = op;
		}
	;

present
	: ATTR_STR EQ_STAR
		{
			var op = ast.createOperation("present");
			op.attr = $1;
			$$ = op;
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
