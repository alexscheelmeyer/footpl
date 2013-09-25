Introduction
-----

A templating library designed for being flexible, concise and powerful. It does have a test suite but it is purposefully not designed to keep you from shooting yourself in the foot. 

Philosophy
-----
A templating library is basically a tool for inverting the data/code duality. It needs to do two things well : a) take a piece of data (such as a string) and recognize all parts
that are actually code - and b) invert the logic so that instead of data with some code, you have code with some data. After this invertion has been done, all you have to do is run
the code to produce the expected data.
This duality is also at the heart of the power that programming in Lisp provides. There you have the quote/unquote mechanisms. Here it is done through escape-tags in the data to mark
code parts. This explains why templating libraries are so useful.

Installation
-----
Not published yet, but will be 

    npm install footpl

