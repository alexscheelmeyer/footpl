var FooTpl=require('../footpl');
var assert=require('assert');

describe('With Tag',function(){
	it('should be able to include from file',function(){
		var foo=new FooTpl();
		var tpl='{% with "tagwithhelper.foo" %}{% endwith %}';
		var renderTpl=foo.compile(tpl,{basePath:__dirname});
		assert.equal(renderTpl(),'habla espanol?');
	});

	it('should pass through parameters to included template',function(){
		var foo=new FooTpl();
		var tpl='{% with "tagwithhelper2.foo" %}{% endwith %}';
		var renderTpl=foo.compile(tpl,{basePath:__dirname});
		assert.equal(renderTpl({language:'svenska'}),'habla svenska?');
	});

	it('should allow overriding blocks',function(){
		var foo=new FooTpl();
		var tpl='{% with "tagwithhelper3.foo" %}{% block test %}habla svenska?{% endblock %}{% endwith %}';
		var renderTpl=foo.compile(tpl,{basePath:__dirname});
		assert.equal(renderTpl(),'->habla svenska?');
	});

	it('should allow calling super',function(){
		var foo=new FooTpl();
		var tpl='{% with "tagwithhelper4.foo" %}{% block test %}{% super %}<-{% endblock %}{% endwith %}';
		var renderTpl=foo.compile(tpl,{basePath:__dirname});
		assert.equal(renderTpl(),'->habla espanol?<-');
	});

});
