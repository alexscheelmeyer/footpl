var FooTpl=require('../footpl');
var assert=require('assert');

describe('Import Tag',function(){
	it('should be able to use macros from file',function(){
		var foo=new FooTpl();
		var tpl='{% import "tagimporthelper.foo" as bar %}{# bar.test() #}{# bar.test2("svenska") #}';
		var renderTpl=foo.compile(tpl,{basePath:__dirname});
		console.log(renderTpl.code);
		assert.equal(renderTpl(),'\nhabla espanol?\n\nhabla svenska?\n');
	});

});
