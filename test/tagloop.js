var FooTpl=require('../footpl');
var assert=require('assert');

describe('Loop Tag',function(){
	it('should be able to repeat a number of times',function(){
		var foo=new FooTpl();
		var tpl='{% loop a 1 to 8 %}loop{% endloop %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl(),'looplooplooplooplooplooplooploop');
	});

	it('should have loop index',function(){
		var foo=new FooTpl();
		var tpl='{% loop a 1 to 8 %}a={# loop.index #}\n{% endloop %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl(),'a=1\na=2\na=3\na=4\na=5\na=6\na=7\na=8\n');
	});

});
