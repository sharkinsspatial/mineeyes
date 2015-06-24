#MineEyes

Attempt at building a simple responsive application without using MV* or CSS
frameworks to brush up my memory a bit.  Provides information about current
mining protests, mining projects and earthquakes with respect to Canadian
workers in Peru.

Development requirements assume Grunt installed on your system.  To install the Grunt cli
````shell
$ npm install -g grunt-cli
````
To serve the application locally I use [serve](https://github.com/tj/serve) you can install it globally using
````shell
$ npm install -g serve
````
And run
````shell
$ serve
````
To run the application locally on port 3000.

To deploy to production on Amazon s3 you will need to create a .json file with your Amazon key and replace the reference in <code>aws</code> property of the <code>Gruntfile.js</code> (Please don't commit this change to the repository).

You can then run 
````shell
$ grunt build ````
Which will create a production build of the application and push it to s3 for
hosting.
