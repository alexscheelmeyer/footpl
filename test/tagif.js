var FooTpl=require('../footpl');
var assert=require('assert');

describe('If Tag',function(){
	it('should include when true',function(){
		var foo=new FooTpl();
		var tpl='{% if habla %}espanol!{% endif %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl({habla:true}),'espanol!');
	});

	it('should exclude when false',function(){
		var foo=new FooTpl();
		var tpl='{% if habla %}espanol!{% endif %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl({habla:false}),'');
	});

	it('should allow else',function(){
		var foo=new FooTpl();
		var tpl='{% if habla %}espanol!{% else %}no habla{% endif %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl({habla:false}),'no habla');
	});

	it('should allow elseif',function(){
		var foo=new FooTpl();
		var tpl='{% if habla %}espanol!{% elseif prata %}svenska!{% else %}no habla{% endif %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl({habla:false,prata:true}),'svenska!');
	});

});
