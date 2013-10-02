var FooTpl=require('../footpl');
var assert=require('assert');

describe('With Tag',function(){
	var foo=new FooTpl({basePath:__dirname});

	it('should be able to include from file',function(){
		var tpl='{% with "tagwithhelper.foo" %}{% endwith %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl(),'habla espanol?');
	});

	it('should pass through parameters to included template',function(){
		var tpl='{% with "tagwithhelper2.foo" %}{% endwith %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl({language:'svenska'}),'habla svenska?');
	});

	it('should pass through importPaths to included template',function(){
		var tpl='{% with "tagwithhelper5.foo" %}{% endwith %}';
		var renderTpl=foo.compile(tpl,{importPaths:[__dirname+'/tagimportfolder']});
		assert.equal(renderTpl({language:'svenska'}),'\nhabla svenska?\n');
	});

	it('should allow overriding blocks',function(){
		var tpl='{% with "tagwithhelper3.foo" %}{% block test %}habla svenska?{% endblock %}{% endwith %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl(),'->habla svenska?');
	});

	it('should allow calling super',function(){
		var tpl='{% with "tagwithhelper4.foo" %}{% block test %}{% super %}<-{% endblock %}{% endwith %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl(),'->habla espanol?<-');
	});

	it('should have references to parameters in overriding blocks',function(){
		var tpl='{% with "tagwithhelper3.foo" %}{% block test %}habla {# language #}?{% endblock %}{% endwith %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl({language:'svenska'}),'->habla svenska?');
	});

});
