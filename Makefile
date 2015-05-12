TESTS = test/*.js

test:
	mocha $(TESTS)

parser:
	jison lib/parser.jison -o lib/parser.js

.PHONY: test
