var FooTpl=require('../footpl');
var assert=require('assert');

describe('Import Tag',function(){
	it('should be able to use macros from file',function(){
		var foo=new FooTpl();
		var tpl='{% import "tagimporthelper.foo" as bar %}{# bar.test() #}{# bar.test2("svenska") #}';
		var renderTpl=foo.compile(tpl,{basePath:__dirname});
		assert.equal(renderTpl(),'\nhabla espanol?\n\nhabla svenska?\n');
	});

	it('should search additional import-paths',function(){
		var foo=new FooTpl({importPaths:[__dirname+'/tagimportfolder']});
		var tpl='{% import "tagimportpathhelper.foo" as bar %}{# bar.test() #}{# bar.test2("svenska") #}';
		var renderTpl=foo.compile(tpl,{basePath:__dirname});
		assert.equal(renderTpl(),'\nhabla espanol?\n\nhabla svenska?\n');
	});
});
