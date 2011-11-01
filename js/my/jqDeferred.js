/*
	Deferred object abstracted from jQuery
 */
define(['jquery'], function ($) {

	function Deferred () {}

	// Deferred constructor
	function fixDfd (dfd) {
		// monkey-patch Deferred to comply with CommonJS Promises/A
		var cjsPromise;

		// crockford beget
		Deferred.prototype = dfd;
		cjsPromise = new Deferred();
		delete Deferred.prototype;

		// promise is a property, not a function in most compliant libs
		cjsPromise.promise = dfd.promise();

		// comply with CommonJS Promises/A chaining
		// TODO: test this!
		cjsPromise.then = function then (cb, eb, pb) {
			return dfd.then(function (val) {
				dfd = fixDfd(dfd);
			}, eb, pb);
		};

		return cjsPromise;
	}

	return function () {
		return fixDfd(new $.Deferred());
	}

});
