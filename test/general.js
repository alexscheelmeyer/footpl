var FooTpl=require('../footpl');
var assert=require('assert');

describe('compile',function(){
	var foo=new FooTpl();

	it('should ignore missing var',function(){
		var tpl='habla {# missing #}espanol';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl({}),'habla espanol');
	});

	it('should only evaluate var once',function(){
		var tpl='{# inc() #}{# inc() #}';
		var renderTpl=foo.compile(tpl);
		var counter=0;
		function inc(){
			counter++;
			return counter;
		}
		assert.equal(renderTpl({inc:inc}),'12');
	});

	it('should throw on unrecognized command',function(){
		var tpl='{% unknown %}';
		assert.throws(function(){foo.compile(tpl);});
	});

	it('should allow rendering file directly',function(){
		assert.equal(foo.renderFile(__dirname+'/tagwithhelper2.foo',{language:'svenska'}),'habla svenska?');
	});

	it('should have templatefile constant',function(){
		assert.equal(foo.renderFile(__dirname+'/templatefile.foo'),'templatefile.foo');
	});

	it('should strip <CR>',function(){
		var tpl='habla\r\nespanol';
		var renderTpl=foo.compile(tpl);
		assert.equal(renderTpl({}),'habla\nespanol');
	});

	it('should allow adding import-paths',function(){
		var foo=new FooTpl();
		foo.addImportPath(__dirname);
		var found=false;
		for(var i=0;i<foo.options.importPaths.length;i++){
			if(foo.options.importPaths[i]===__dirname)found=true;
		}
		assert.ok(found);
	});

	it('should have express engine api',function(done){
		var engine=foo.expressEngine();
		engine(__dirname+'/tagwithhelper2.foo',{language:'svenska'},function(err,rendered){
			assert.ifError(err);
			assert.equal(rendered,'habla svenska?');
			done();
		});
	});

});
