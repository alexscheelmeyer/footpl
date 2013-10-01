var FooTpl=require('../footpl');
var assert=require('assert');

describe('compile',function(){
	it('should ignore missing var',function(){
		var foo=new FooTpl();
		var tpl='habla {# missing #}espanol';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl({}),'habla espanol');
	});
});
