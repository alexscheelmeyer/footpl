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

var start=new Date();
for(var t=0;t<100000;t++){
	var out=doTtemplate(parameters);
	if(out!==expected)throw new Error('mismatch');
}
var end=new Date();

console.log('doT:',end.getTime()-start.getTime());

var start=new Date();
for(var t=0;t<100000;t++){
	var out=fooTemplate(parameters);
	if(out!==expected)throw new Error('mismatch');
}
var end=new Date();

console.log('foo:',end.getTime()-start.getTime());

