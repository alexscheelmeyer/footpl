var FooTpl=require('../footpl');
var assert=require('assert');

describe('Import Tag',function(){
	var foo=new FooTpl({basePath:__dirname});

	it('should be able to use macros from file',function(){
		var tpl='{% import "tagimporthelper.foo" as bar %}{# bar.test() #}{# bar.test2("svenska") #}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl(),'\nhabla espanol?\n\nhabla svenska?\n');
	});

	it('should allow imported macros to reference parameters',function(){
		var tpl='{% import "tagimporthelper2.foo" as bar %}{# bar.test() #}';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl({language:'svenska'}),'\nhabla svenska?\n');
	});

	it('should not clobber globals',function(){
		var tpl='{% import "tagimporthelper.foo" as bar %}{# bar.test() #}{# bar.test2("svenska") #}';
		var renderTpl=foo.compile(tpl);

		var code='var __test=(function(){\n'+renderTpl.code+'\n})();\nif(global["test"]!==undefined)throw new Error("clobbered");\nif(global["test2"]!==undefined)throw new Error("clobbered");\nreturn __test;\n';
		var func=new Function('__dict',code);

		assert.equal(func(),'\nhabla espanol?\n\nhabla svenska?\n');
	});
	

	it('should search additional import-paths',function(){
		var tpl='{% import "tagimportpathhelper.foo" as bar %}{# bar.test() #}{# bar.test2("svenska") #}';
		var renderTpl=foo.compile(tpl,{importPaths:[__dirname+'/tagimportfolder']});
		assert.equal(renderTpl(),'\nhabla espanol?\n\nhabla svenska?\n');
	});
});
