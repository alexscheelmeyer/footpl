Introduction
-----
A templating library designed for being flexible, concise and powerful. It does have a test suite but it is purposefully not designed to keep you from shooting yourself in the foot. 

Features
-----
Some of the features supported
   * All basic logic needed
   * Reuse through macros and inheritance
   * Integrates well with Javascript
   * Configurable include-paths
   * Pretty good performance
   * No dependencies
   * Built-in Express.js support

Philosophy
-----
A templating library is basically a tool for inverting the data/code duality. It needs to do two things well : a) take a piece of data (such as a string) and recognize all parts
that are actually code - and b) invert the logic so that instead of data with some code, you have code with some data. After this invertion has been done, all you have to do is invoke
the code to produce the expected data.

This duality is also at the heart of the power that programming in Lisp provides. You have the quote/unquote mechanisms and quasiquote is basically a templating engine.

Installation
-----
Use npm: 

    npm install footpl

Usage
-----
To delimit the code from the data, FooTpl uses two sets of escape-tags. The difference is that one set is for expressing
code-logic such as conditionals or iteration and the other is for outputting values.

Outputting values is through the `{#` and `#}` set of code-escape-tags.
```html
<title>{# title #}</title>
```
This assumes that `title` is part of the parameters sent to the template-function.

Code-logic instead uses the `{%` and `%}` set of variable-escape-tags.
```html
{% if loggedIn %}
<a href="logout();">Logout</a>
{% else %}
<a href="login();">Login</a>
{% endif %}
```

To use a template the process is to compile the template first to get a function. Calling that function with parameters
will then produce the output.

```javascript
var FooTpl=require('footpl');
var foo=new FooTpl();
var tpl='habla {# language #}?';
var renderTpl=foo.compile(tpl);
renderTpl({language:'espanol'}); //produces "habla espanol?"
```

Supported Tags
-----

### If
An if tag takes an arbitrary conditional statement and outputs the data within the tag if evaluated to true. You can
use `else` and `elseif`. You must remember to close the tag with `endif`

```
{% if habla %}
  espanol!
{% elseif prata %}
  svenska!
{% else %}
  no habla
{% endif %}
```

### Set
The set tag is used to set a named variable to a value. This can sometimes be necessary to avoid repeated code.

```
{% set habla true %}
{% if habla %}espanol!{% endif %}
```
will always output "espanol!"

### Each
The each tag is used to repeat some data for all the items in an array or all the keys in an object.

You can decide the name for each item and use that to reference it within the tag.
Assuming the parameter alphabet is provided to the compiled function, this will print the alphabet:
```
{% each character in alphabet %}{# character #}\n{% endeach %}
```
Within the each tag you also have access to certain special variables.

  * loop.index - the 0-base index into the array or object.
  * loop.index1 - the 1-base index into the array or object.
  * loop.first - true if this is the first item in an array.
  * loop.last - true if this is the last item in an array.


### Loop
The loop tag is similar to the each tag but allows you to control the index-value yourself.

```
{% loop a 1 to 8 %}loop{% endloop %}
```
Will print "loop" 8 times (both start and stop value is included.

Similarly to the each tag you have access to `loop.index` and `loop.index1` within the loop body.

### Macro
A macro is like a function declaration. It is a piece of template that you want to reuse in several places. They
can receive parameters just like normal functions.

```
{% macro habla(language) %}
habla {# language #}?
{% endmacro %}

{# habla("espanol") #}
```
Will produce "habla espanol?".


### Import
Macros are especially nice when you collect your best ones into a library of macros to be reused across your site(s).
To get access to these reusable pieces you use the import tag to import them into the template where you need them.


Assuming you have a "head.foo" file with a "style" macro for creating style tags :
```html
{% import "head.foo" as head %}
<head>
{# head.style("main") #}
</head>
```
could produce the proper head-tag you want :
```html
<head>
<link rel="stylesheet" type="text/css" href="main.css" />
</head>
```

### With
The with tag is for inheritance. You use it together with the block tag to delimit parts of the parent template
that you want to override in the child-template.

So given you have a template file with this content
```
->{% block test %}habla espanol?{% endblock %}
```
and you reference that as "parent.foo" in another template
```
{% with "parent.foo" %}
{% block test %}habla svenska?{% endblock %}
{% endwith %}
```
it will produce "->habla svenska?" as the test-block in the child will override the parent block but you still get the
"->" part from the parent.

If you want to output the output of the overrided block you can reference it with the super tag :

```
{% with "parent.foo" %}
{% block test %}
{% super %}<-
{% endblock %}
{% endwith %}
```
will produce "->habla espanol?<-".

Remember to always close the with tag with `endwith`. This actually allows you to do multiple parts in your template
that inherits from different parent templates, the parent template is not global.

Details to Note
-----
### Whitespace
Within templates no whitespace is ignored. This allows you to control whether you want newlines or not. So
```
{% if present %}yes!{% endif %}
```
will not contain newlines but 
```
{% if present %}
yes!
{% endif %}
```
will contain 2.

### Undefined Variables
When using variable-escape-tags it will be silently ignored if the variable is undefined. However this is not the
case if the variable is referenced in an object that is itself undefined. So assuming that `title` is undefined:
```html
<title>{# title #}</title>
```
will output an empty tag, but :
```html
<title>{# title.toUpperCase() #}</title>
```
will fail. This reflects how Javascript works.

### Arbitrary Code
While FooTpl allows you use arbitrary code in certain places, it also needs to parse that to be able know which
variables you reference. This is to allow you the convenience of writing `{# title #}` instead of being required
to always reference a parameters object such as in `{# __parms.title #}`. FooTpl has been tested in real scenarios
but keep in mind that if you do exceedingly tricky stuff it will probably fail to gather the right references.
Please be gentle.

If it fails let me know though, and I will try to fix it.


Integration With Express.js
-----
To facilitate easy usage from Express, an instance of FooTpl provides you with the `expressEngine` method.

```javascript
app.engine('.html',foo.expressEngine());
```
This tells Express to use FooTpl for rendering your views, simple as that.


