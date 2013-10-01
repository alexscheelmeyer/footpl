var doT=require('dot');
var FooTpl=require('../footpl');
var foo=new FooTpl();

var parameters={
	header: "Header",
	header2: "Header2",
	header3: "Header3",
	header4: "Header4",
	header5: "Header5",
	header6: "Header6",
	list: ['1000000000', '2', '3', '4', '5', '6', '7', '8', '9', '10']
};

var doTtemplate=doT.template("<div><h1 class='header'>{{=it.header}}</h1><h2 class='header2'>{{=it.header2}}</h2><h3 class='header3'>{{=it.header3}}</h3><h4 class='header4'>{{=it.header4}}</h4><h5 class='header5'>{{=it.header5}}</h5><h6 class='header6'>{{=it.header6}}</h6><ul class='list'>{{for(var i = 0,l=it.list.length;i<l;i++) { }}<li class='item'>{{=it.list[i]}}</li>{{ } }}</ul></div>");

var fooTemplate=foo.compile("<div><h1 class='header'>{# header #}</h1><h2 class='header2'>{# header2 #}</h2><h3 class='header3'>{# header3 #}</h3><h4 class='header4'>{# header4 #}</h4><h5 class='header5'>{# header5 #}</h5><h6 class='header6'>{# header6 #}</h6><ul class='list'>{% each item in list %}<li class='item'>{# item #}</li>{% endeach %}</ul></div>");

var expected="<div><h1 class='header'>Header</h1><h2 class='header2'>Header2</h2><h3 class='header3'>Header3</h3><h4 class='header4'>Header4</h4><h5 class='header5'>Header5</h5><h6 class='header6'>Header6</h6><ul class='list'><li class='item'>1000000000</li><li class='item'>2</li><li class='item'>3</li><li class='item'>4</li><li class='item'>5</li><li class='item'>6</li><li class='item'>7</li><li class='item'>8</li><li class='item'>9</li><li class='item'>10</li></ul></div>";

console.log(doTtemplate.toString());
console.log(fooTemplate.code);

var manualTemplate=function(__dict){
	if(__dict===undefined)__dict={};
//	return (function(header,header2,header3,header4,header5,header6,list,item){

	var header=__dict["header"];
	var header2=__dict["header2"];
	var header3=__dict["header3"];
	var header4=__dict["header4"];
	var header5=__dict["header5"];
	var header6=__dict["header6"];
	var list=__dict["list"];
	var item=__dict["item"];

		var __str="";
		__str+="<div><h1 class='header'>";
		__str+=(( header )!==undefined ?  header  : "");
		__str+="</h1><h2 class='header2'>";
		__str+=(( header2 )!==undefined ?  header2  : "");
		__str+="</h2><h3 class='header3'>";
		__str+=(( header3 )!==undefined ?  header3  : "");
		__str+="</h3><h4 class='header4'>";
		__str+=(( header4 )!==undefined ?  header4  : "");
		__str+="</h4><h5 class='header5'>";
		__str+=(( header5 )!==undefined ?  header5  : "");
		__str+="</h5><h6 class='header6'>";
		__str+=(( header6 )!==undefined ?  header6  : "");
		__str+="</h6><ul class='list'>";
		function __loop1(item,loop){
			var __str="";
			__str+="<li class='item'>";
			__str+=(( item )!==undefined ?  item  : "");
			__str+="</li>";
			return __str;
		}
		if(list instanceof Array){
			for(var __i=0;__i<list.length;__i++){
			__str+="<li class='item'>";
			__str+=(( list[__i] )!==undefined ?  list[__i]  : "");
			__str+="</li>";

//				__str+=__loop1(list[__i],{index:__i,index1:__i+1,first:__i===0,last:__i===list.length-1});
			}
		}else{
			var __i=0;
			for(var __key in list){
				__str+=__loop1(list[__key],{index:__i,index1:__i+1,key:__key});
				__i++;
			}
		}
		__str+="</ul></div>";
		return __str;
//	})(__dict["header"],__dict["header2"],__dict["header3"],__dict["header4"],__dict["header5"],__dict["header6"],__dict["list"],__dict["item"]);
}


var start=new Date();
for(var t=0;t<1000000;t++){
	var out=manualTemplate(parameters);
	if(out!==expected)throw new Error('mismatch');
}
var end=new Date();

console.log('manual:',end.getTime()-start.getTime());

var start=new Date();
for(var t=0;t<1000000;t++){
	var out=doTtemplate(parameters);
	if(out!==expected)throw new Error('mismatch');
}
var end=new Date();

console.log('doT:',end.getTime()-start.getTime());

var start=new Date();
for(var t=0;t<1000000;t++){
	var out=fooTemplate(parameters);
	if(out!==expected)throw new Error('mismatch');
}
var end=new Date();

console.log('foo:',end.getTime()-start.getTime());

