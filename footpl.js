var fs=require('fs');
var path=require('path');

var codeFunctions={
	'set (.*?) (.*?)':function(ctx,variable,val){
		ctx.addReferences(variable);
		return variable+'='+val+';\n';
	},
	'each (.*?) in (.*?)':function(ctx,variable,collection){
		ctx.open('each');
		ctx.addReferences(collection);
		var code='for(var __i=0;__i<'+collection+'.length;__i++){\n';
		code+='  var loop={index:__i,index1:__i+1,first:__i===0,last:__i==='+collection+'.length-1};\n';
		code+='  var '+variable+'='+collection+'[__i];\n';
		return code;
	},
	'endeach':function(ctx){ctx.close('each');return '}\n';},
	'loop (.*?) (.*?) to (.*?)':function(ctx,variable,start,stop){
		ctx.open('loop');
		var code='for(var '+variable+'='+start+';'+variable+'<='+stop+';'+variable+'++){\n';
		code+='  var loop={index:'+variable+'};\n';
		return code;
	},
	'endloop':function(ctx){ctx.close('loop');return '}\n';},
	'if (.*?)':function(ctx,condition){
		ctx.open('if');
		ctx.addReferences(condition);
		return 'if('+condition+'){\n';
	},
	'elseif (.*?)':function(ctx,condition){
		ctx.addReferences(condition);
		return '}\nelse if('+condition+'){\n';
	},
	'else':function(ctx){return '}\nelse{\n';},
	'endif':function(ctx){ctx.close('if');return '}\n';},
	'with \"(.*?)\"':function(ctx){return 'with';},
	'endwith':function(ctx){return 'endwith';},
	'block (.*?)':function(ctx){return 'block';},
	'endblock':function(ctx){return 'endblock';},
	'macro ([^\\(]*)\\(([^\\)]*?)\\)':function(ctx,name,parms){
		ctx.open('macro');
		var code='function '+name+'('+parms+'){\n';
		code+='var str="";\n';
		return code;
	},
	'endmacro':function(ctx){ctx.close('macro');return 'return str;\n}\n';},
	'import "(.*?)" as (.*?)':function(ctx,filename,name){
		var fullPath=path.resolve(ctx.basePath,filename);
		var fileData=fs.readFileSync(fullPath).toString();
		var foo=new FooTpl();
		var macros=[];
		var prevLength=0;
		var func=foo.compile(fileData,{basePath:path.dirname(fullPath),contextHook:function(ctx,action,name){
			if((action==='open')&&(name==='macro')){
				prevLength=ctx.getFunc().length;
			}
			if((action==='close')&&(name==='macro')){
				macros.push({name:'ehem',code:ctx.getFunc().substr(prevLength)});
			}
		}});

		var code='var '+name+'={\n';
		for(var m=0;m<macros.length;m++){
			if(m>0)code+=',';
			code+=macros[m].name+':'+macros[m].code;
		}
		code+='}\n';
		return code;
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
			return code;
		}
	}

	return 'str+=dict["'+tag+'"];\n';
}


function addData(text){
	if(text.length<=0)return '';
	text=text.replace(/\n/g,'\\n');
	return 'str+="'+text+'";\n';
}


var Context=function(basePath){
	this.references=[];
	this.stack=[];
	this.basePath=basePath || __dirname;
	this.hook=null;
	this.func='var str="";\n';
}

Context.prototype.getFunc=function(){return this.func;}

Context.prototype.addData=function(text){
	if(text.length<=0)return;
	text=text.replace(/\n/g,'\\n');
	this.func+='str+="'+text+'";\n';
}

Context.prototype.addValue=function(val){
	this.func+='str+='+val+';\n';
}

Context.prototype.addCode=function(code){
	this.func+=code;
}

Context.prototype.setHook=function(hook){
	this.hook=hook;
}

Context.prototype.addReferences=function(str){
	var noOperators=str.replace(/[^\w\s.]/g,' ');
	var parts=noOperators.split(' ');
	for(var p=0;p<parts.length;p++){
		var part=parts[p];
		part=part.replace(/\s/g,'');
		if(part.indexOf('.')>0)part=part.split('.')[0];
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
	if(this.stack.length>0)return this.stack[this.stack.length-1].name;
}

Context.prototype.open=function(name){
	this.stack.push({name:name});

	if(this.hook!==null)this.hook(this,'open',name);
}

Context.prototype.close=function(name){
	var curName=this.curName();
	if(curName===name)this.stack.pop();
	else throw new Error('unbalanced section, '+curName+' was open, but trying to close '+name);
	if(this.hook!==null)this.hook(this,'close',name);
}

Context.prototype.isOpen=function(){
	return this.stack.length>0;
}

var FooTpl=module.exports=function(){}

FooTpl.prototype.compile=function(template,options){
	if(options===undefined)options={};
	var stTEXT='TEXT';
	var stTAG='TAG';
	var stVAL='VAL';
	var chCURLY='{';
	var chCURLY2='}';
	var chSECOND='%';
	var chVAL='#';
	var state=stTEXT;
	var func='var str="";\n';
	var text='';
	var tag='';
	var val='';
	var ctx=new Context(options.basePath);
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
					ctx.addCode(compileTag(ctx,tag));
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
					ctx.addValue(val);
					continue;
				}
			}
			val+=c;
			break;
		}
	}
	ctx.addData(text);
	ctx.addCode('return str;\n');

	if(ctx.isOpen())throw new Error('missing end for tag'+ctx.curName());

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
	var func=header+ctx.getFunc()+footer+');\n';
	console.log(func);
	var compiled=new Function('__dict',func);
	compiled.code=func;
	return compiled;
}



