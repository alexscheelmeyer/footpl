var FooTpl=require('../footpl');
var assert=require('assert');

describe('Block Tag',function(){
	var foo=new FooTpl();

	it('should pass through when not used as base template',function(){
		var tpl='{% block test %}habla espanol?{% endblock %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl(),'habla espanol?');
	});

	it('should not shadow parameter namespace',function(){
		var tpl='{% block language %}habla {# language #}?{% endblock %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl({language:'espanol'}),'habla espanol?');
	});

	it('should not allow nested blocks',function(){
		var tpl='{% block language %}{% block nested %}{% endblock %}{% endblock %}';
		assert.throws(function(){foo.compile(tpl)},foo.StructuralError);
	});

});
