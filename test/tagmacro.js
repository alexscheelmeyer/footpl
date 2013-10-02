var FooTpl=require('../footpl');
var assert=require('assert');

describe('Macro Tag',function(){
	var foo=new FooTpl();

	it('should be able to invoke',function(){
		var tpl='{% macro test() %}habla espanol?{% endmacro %}{# test() #}{# test() #}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl(),'habla espanol?habla espanol?');
	});

	it('should be able to use parameters',function(){
		var tpl='{% macro habla(language) %}habla {# language #}?{% endmacro %}{# habla("espanol") #}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl(),'habla espanol?');
	});

});
