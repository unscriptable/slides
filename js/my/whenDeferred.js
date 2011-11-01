/*
	Deferred object abstracted from when.js
 */
define(['when'], function (when) {

	// Deferred constructor
	return function Deferred () {
		return when.defer();
	};

});
