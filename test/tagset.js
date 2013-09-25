var FooTpl=require('../footpl');
var assert=require('assert');

describe('Set Tag',function(){
	it('should set existing var',function(){
		var foo=new FooTpl();
		var tpl='{% set habla true %}{% if habla %}espanol!{% endif %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl({habla:false}),'espanol!');
	});

	it('should not clobber global scope',function(){
		var foo=new FooTpl();
		var tpl='{% set habla true %}{% set espanol "hello world" %}!';
		var renderTpl=foo.compile(tpl);
		var code='var __test=(function(){\n'+renderTpl.code+'\n})();\nif(global["habla"]!==undefined)throw new Error("clobbered");\nif(global["espanol"]!==undefined)throw new Error("clobbered");\nreturn __test;\n';
		var func=new Function('__dict',code);
		assert.equal(func(),'!');
	});

	it('should be able to use new var',function(){
		var foo=new FooTpl();
		var tpl='{% set habla true %}{% if habla %}espanol!{% endif %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl(),'espanol!');
	});
});
