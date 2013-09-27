var fs=require('fs');
var path=require('path');

var codeFunctions={
	'set (.*?) (.*?)':function(ctx,variable,val){
		ctx.addReferences(variable);
		ctx.addCode(variable+'='+val+';\n');
	},
	'each (.*?) in (.*?)':function(ctx,variable,collection){
		ctx.open('each');
		ctx.addReferences(collection);
		var code='for(var __i=0;__i<'+collection+'.length;__i++){\n';
		code+='  var loop={index:__i,index1:__i+1,first:__i===0,last:__i==='+collection+'.length-1};\n';
		code+='  var '+variable+'='+collection+'[__i];\n';
		ctx.addCode(code);
	},
	'endeach':function(ctx){ctx.addCode('}\n');ctx.close('each');},
	'loop (.*?) (.*?) to (.*?)':function(ctx,variable,start,stop){
		ctx.open('loop');
		var code='for(var '+variable+'='+start+';'+variable+'<='+stop+';'+variable+'++){\n';
		code+='  var loop={index:'+variable+'};\n';
		ctx.addCode(code);
	},
	'endloop':function(ctx){ctx.addCode('}\n');ctx.close('loop');},
	'if (.*?)':function(ctx,condition){
		ctx.open('if');
		ctx.addReferences(condition);
		ctx.addCode('if('+condition+'){\n');
	},
	'elseif (.*?)':function(ctx,condition){
		ctx.addReferences(condition);
		ctx.addCode('}\nelse if('+condition+'){\n');
	},
	'else':function(ctx){ctx.addCode('}\nelse{\n');},
	'endif':function(ctx){ctx.addCode('}\n');ctx.close('if');},
	'with \"(.*?)\"':function(ctx,filename){
		var fullPath=ctx.resolve(filename);
		var fileData=fs.readFileSync(fullPath).toString();
		var foo=new FooTpl();
		var subCtx=foo.compileCore(fileData,{basePath:path.dirname(fullPath)});
		ctx.open('with',{blocks:subCtx.getBlocks()});
		for(var r=0;r<subCtx.references.length;r++){
			ctx.addReferences(subCtx.references[r]);
		}
		ctx.addCode(subCtx.getFunc());
		ctx.pushState();
	},
	'endwith':function(ctx){
		var oldFrame=ctx.close('with');
		var blocks=ctx.getBlocks();
		var combinedBlocks=[];
		for(var b=0;b<oldFrame.blocks.length;b++){
			var superBlock=oldFrame.blocks[b];
			var overrideBlock=null;
			for(var b2=0;b2<blocks.length;b2++){
				if(blocks[b2].name===superBlock.name){
					overrideBlock=blocks[b2];
					break;
				}
			}
			if(overrideBlock!==null){
				combinedBlocks.push({name:overrideBlock.name,code:'function(){return ('+overrideBlock.code+')('+superBlock.code+');\n}'});
			}
			else combinedBlocks.push(superBlock);
		}
		var savedReferences=ctx.references.slice(0);
		ctx.popState();
		//popstate discards everything that has not been explicitly transfered, so add back the references that might have come from overriding blocks
		for(var r=0;r<savedReferences.length;r++)ctx.addReferences(savedReferences[r]);
		ctx.close('with'); //close it again since we just popped a previous state where is was still open
		for(var cb=0;cb<combinedBlocks.length;cb++)ctx.addBlock(combinedBlocks[cb].name,combinedBlocks[cb].code);
	},
	'block (.*?)':function(ctx,name){
		ctx.open('block',{name:name});
		ctx.addValue('__blocks.'+name+'()');
		ctx.buffering(true);
		var code='function(__super){\n';
		code+='var str="";\n';
		ctx.addCode(code);
	},
	'endblock':function(ctx){
		ctx.addCode('return str;\n}\n');
		var buf=ctx.getBuffer();
		ctx.buffering(false);
		ctx.clearBuffer();
		var oldFrame=ctx.close('block');
		ctx.addBlock(oldFrame.name,buf);
	},
	'super':function(ctx){
		ctx.addValue('__super()');
	},
	'macro ([^\\(]*)\\(([^\\)]*?)\\)':function(ctx,name,parms){
		ctx.open('macro',{name:name,parms:parms});
		var code='function '+name+'('+parms+'){\n';
		code+='var str="";\n';
		ctx.addCode(code);
	},
	'endmacro':function(ctx){ctx.addCode('return str;\n}\n');ctx.close('macro');},
	'import "(.*?)" as (.*?)':function(ctx,filename,name){
		var fullPath=ctx.resolve(filename);
		var fileData=fs.readFileSync(fullPath).toString();
		var foo=new FooTpl();
		var macros=[];
		var prevLength=0;
		var func=foo.compile(fileData,{basePath:path.dirname(fullPath),contextHook:function(ctx,action,name,frame){
			if((action==='open')&&(name==='macro')){
				prevLength=ctx.getFunc().length;
			}
			if((action==='close')&&(name==='macro')){
				macros.push({name:frame.name,code:ctx.getFunc().substr(prevLength)});
			}
		}});

		var code='var '+name+'={\n';
		for(var m=0;m<macros.length;m++){
			if(m>0)code+=',';
			code+=macros[m].name+':'+macros[m].code;
		}
		code+='}\n';
		ctx.addCode(code);
	}
};
//massage code patterns into proper (ugly) regex
var codePatterns=[];
for(var codePattern in codeFunctions){
	var rePattern='^\\s*'+codePattern+'\\s*$';
	codePatterns.push({str:codePattern,re:new RegExp(rePattern),func:codeFunctions[codePattern]});
};

function compileTag(ctx,tag){
	for(var p=0;p<codePatterns.length;p++){
		var pattern=codePatterns[p];
		var matched=tag.match(pattern.re);
		if(matched!==null){
			var args=[ctx].concat(matched.slice(1));
			var code=pattern.func.apply(null,args);
			return;
		}
	}

	//unrecognized tag - ignore
}


var Context=function(importPaths){
	this.states=[];
	this.references=[];
	this.stack=[];
	this.importPaths=importPaths || [__dirname];
	this.hook=null;
	this.func='';
	this.shouldBuffer=false;
	this.buffer='';
	this.blocks=[];
}

Context.prototype.pushState=function(){
	this.states.push({references:this.references.slice(0),
					  stack:this.stack.slice(0),
					  importPaths:this.importPaths.slice(0),
					  hook:this.hook,
					  func:this.func,
					  shouldBuffer:this.shouldBuffer,
					  buffer:this.buffer,
					  blocks:this.blocks.slice(0)});
}

Context.prototype.popState=function(){
	var oldState=this.states.pop();
	this.references=oldState.references;
	this.stack=oldState.stack;
	this.importPaths=oldState.importPaths;
	this.hook=oldState.hook;
	this.func=oldState.func;
	this.shouldBuffer=oldState.shouldBuffer;
	this.buffer=oldState.buffer;
	this.blocks=oldState.blocks;
}

Context.prototype.getFunc=function(){return this.func;}

Context.prototype.getBuffer=function(){return this.buffer;}

Context.prototype.clearBuffer=function(){this.buffer=''}

Context.prototype.buffering=function(yesorno){this.shouldBuffer=yesorno;}

Context.prototype.getBlocks=function(){return this.blocks;}

Context.prototype.addData=function(text){
	if(text.length<=0)return;
	text=text.replace(/\\/g,'\\\\');
	text=text.replace(/\n/g,'\\n').replace(/\"/g,'\\"');
	this.addCode('str+="'+text+'";\n');
}

Context.prototype.addValue=function(val){
	this.addCode('str+='+val+';\n');
}

Context.prototype.addCode=function(code){
	if(this.shouldBuffer)this.buffer+=code;
	else this.func+=code;
}

Context.prototype.addBlock=function(name,code){
	this.blocks.push({name:name,code:code});
}

Context.prototype.setHook=function(hook){
	this.hook=hook;
}

Context.prototype.resolve=function(filename){
	var fullPath=filename;
	for(var p=0;p<this.importPaths.length;p++){
		var full=path.resolve(this.importPaths[p],filename);
		if(fs.existsSync(full)){
			fullPath=full;
			break;
		}
	}
	return fullPath;
}


function isNumber(o){
  return ! isNaN (o-0) && o !== null && o !== "" && o !== false;
}

Context.prototype.addReferences=function(str){
	var noOperators=str.replace(/[^\w\s.]/g,' ');
	var parts=noOperators.split(' ');
	for(var p=0;p<parts.length;p++){
		var part=parts[p];
		part=part.replace(/\s/g,'');
		if(part.indexOf('.')>=0)part=part.split('.')[0];
		if(part.length<=0)continue;
		if(isNumber(part))continue;
		if(part==='JSON')continue;//dont shadow JSON
		var found=false;
		for(var r=0;r<this.references.length;r++){
			if(this.references[r]===part){
				found=true;
				break;
			}
		}
		if(!found) this.references.push(part);
	}
}

Context.prototype.curName=function(){
	if(this.stack.length>0)return this.stack[this.stack.length-1].frameName;
}

Context.prototype.open=function(name,parms){
	var frame={frameName:name};
	if(parms===undefined)parms={};
	for(var p in parms){frame[p]=parms[p];}
	this.stack.push(frame);

	if(this.hook!==null)this.hook(this,'open',name,frame);
}

Context.prototype.close=function(name){
	var curName=this.curName();
	var oldFrame=this.stack.pop();
	if(curName!==name)throw new Error('unbalanced section, '+curName+' was open, but trying to close '+name);
	if(this.hook!==null)this.hook(this,'close',name,oldFrame);
	return oldFrame;
}

Context.prototype.isOpen=function(){
	return this.stack.length>0;
}

var FooTpl=module.exports=function(options){
	this.options=options || {};
	if(this.options.importPaths===undefined)this.options.importPaths=[];
}

FooTpl.prototype.compileCore=function(template,options){
	var stTEXT='TEXT';
	var stTAG='TAG';
	var stVAL='VAL';
	var chCURLY='{';
	var chCURLY2='}';
	var chSECOND='%';
	var chVAL='#';
	var state=stTEXT;
	var text='';
	var tag='';
	var val='';
	var ctx=new Context(this.options.importPaths.concat([options.basePath]));
	if(options.contextHook!==undefined)ctx.setHook(options.contextHook);
	for(var i=0;i<template.length;i++){
		var c=template.charAt(i);
		switch(state){
		case stTEXT:
			if(c===chCURLY){
				var nextC=template.charAt(i+1);
				if(nextC===chSECOND){
					state=stTAG;
					i++;
					ctx.addData(text);
					tag='';
					continue;
				}
				else if(nextC===chVAL){
					state=stVAL;
					i++;
					ctx.addData(text);
					val='';
					continue;					
				}
			}
			text+=c;
			break;
		case stTAG:
			if(c===chSECOND){
				var nextC=template.charAt(i+1);
				if(nextC===chCURLY2){
					state=stTEXT;
					i++;
					text='';
					compileTag(ctx,tag);
					continue;
				}
			}
			tag+=c;
			break;
		case stVAL:
			if(c===chVAL){
				var nextC=template.charAt(i+1);
				if(nextC===chCURLY2){
					state=stTEXT;
					i++;
					text='';
					ctx.addReferences(val);
					ctx.addValue(val);
					continue;
				}
			}
			val+=c;
			break;
		}
	}
	ctx.addData(text);

	if(ctx.isOpen())throw new Error('missing end for tag '+ctx.curName());

	return ctx;
}

FooTpl.prototype.compile=function(template,options){
	if(options===undefined)options={};

	var ctx=this.compileCore(template,options);
	ctx.addCode('return str;\n');

	//make local environment for code
	var header='if(__dict===undefined)__dict={};\nreturn (function(';
	var footer='})(';
	for(var r=0;r<ctx.references.length;r++){
		var comma=',';
		if(r==0)comma='';
		header+=comma+ctx.references[r];
		footer+=comma+'__dict["'+ctx.references[r]+'"]';
	}
	header+='){\n';

	var blocks=ctx.getBlocks();
	header+='var __blocks={\n';
	for(var b=0;b<blocks.length;b++){
		var block=blocks[b];
		if(b>0)header+=',';
		header+=block.name+':'+block.code+'\n';
	}
	header+='}\nvar str="";\n';

	var func=header+ctx.getFunc()+footer+');\n';
//	console.log(func);
	var compiled=new Function('__dict',func);
	compiled.code=func;
	return compiled;
}


//Express JS wrapper
FooTpl.prototype.renderFile=function(fullPath,parameters,callback){
	var fileData=fs.readFileSync(fullPath).toString();
	var foo=new FooTpl();//express.js obscures "this" pointer :(
	var func=foo.compile(fileData,{basePath:path.dirname(fullPath)});
	callback(null,func(parameters));
}
