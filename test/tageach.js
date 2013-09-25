var FooTpl=require('../footpl');
var assert=require('assert');

describe('Each Tag',function(){
	it('should be able to iterate an array',function(){
		var foo=new FooTpl();
		var tpl='{% each character in alphabet %}{# character #}\n{% endeach %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl({alphabet:['a','b','c']}),'a\nb\nc\n');
	});

	it('should have loop index',function(){
		var foo=new FooTpl();
		var tpl='{% each character in alphabet %}{# character #}{# loop.index #}\n{% endeach %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl({alphabet:['a','b','c']}),'a0\nb1\nc2\n');
	});

	it('should have loop index1',function(){
		var foo=new FooTpl();
		var tpl='{% each character in alphabet %}{# character #}{# loop.index1 #}\n{% endeach %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl({alphabet:['a','b','c']}),'a1\nb2\nc3\n');
	});

	it('should support first and last',function(){
		var foo=new FooTpl();
		var tpl='{% each item in list %}{% if loop.first %}<ul>{% endif %}<li>{# item #}</li>{% if loop.last %}</ul>{% endif %}{% endeach %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl({list:['a','b','c']}),'<ul><li>a</li><li>b</li><li>c</li></ul>');
	});

});
