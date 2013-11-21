var FooTpl=require('../footpl');
var assert=require('assert');

describe('Wrap Tag',function(){
	var foo=new FooTpl();

	it('should be able to wrap',function(){
		var tpl='{% macro title(content) %}<title>{# content #}</title>{% endmacro %}{% wrap title() %}habla espanol?{% endwrap %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl(),'<title>habla espanol?</title>');
	});

	it('should pass on parameters',function(){
		var tpl='{% macro header(content,level) %}<h{# level #}>{# content #}</h{# level #}>{% endmacro %}{% wrap header(3) %}habla espanol?{% endwrap %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl(),'<h3>habla espanol?</h3>');
	});

	it('should support wrapnext',function(){
		var tpl='{% macro anchor(url,text) %}<a href="{# url #}">{# text #}</a>{% endmacro %}{% wrap anchor() %}http://google.com{% wrapnext %}search{% endwrap %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl(),'<a href="http://google.com">search</a>');
	});

	it('should support blocks',function(){
		var tpl='{% macro test(a) %}{# a #}{% endmacro %}{% wrap test() %}{% block content %}espanol?{% endblock %}{% endwrap %}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl(),'espanol?');
	});

});
