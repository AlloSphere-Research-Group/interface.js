* every ui widget (e.g. slider or button) is its own file
* gulp script that concatenates into one file that everyone downloads (and down-converts ecma javascript ES6 to ES5)
* e.g. browserify (called using gulp) does dependency scan and concats files in legit manner

* `git clone . . .`
* `npm install` looks in package.json and installs both compile and runtime dependencies locally

* some notes on gulp
	* gulpfile.js is like a makefile
	* browserify adds node-like capabilities to client-side code
