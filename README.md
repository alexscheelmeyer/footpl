Introduction
-----
A templating library designed for being flexible, concise and powerful. It does have a test suite but it is purposefully not designed to keep you from shooting yourself in the foot. 

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

Outputting values is through the `{#` and `#}` set of escape-tags.
```html
<title>{# title #}</title>
```
This assumes that `title` is part of the parameters sent to the template-function.

Code-logic instead uses the `{%` and `%}` set of escape-tags.
```html
{% if loggedIn %}
<a href="logout();">Logout</a>
{% else %}
<a href="login();">Login</a>
{% endif %}
```


Integration With Express.js
-----
To facilitate easy usage from Express, an instance of FooTpl provides you with the `expressEngine` method.

```javascript
app.engine('.html',foo.expressEngine());
```
This tells Express to use FooTpl for rendering your views, simple as that.


