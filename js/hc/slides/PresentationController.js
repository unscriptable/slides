/*
 	@license Copyright (c) 2011 Brian Cavalier
	LICENSE: see the LICENSE.txt file. If file is missing, this file is subject
	to the MIT License at: http://www.opensource.org/licenses/mit-license.php.
 */
/*
	Class: PresentationController
*/
define(['jquery', 'require'], function($, require) {
	
	var undef,
		// Detect touch support
		supportsTouch = 'ontouchstart' in $('body');
	
	/*
		Function: setHash
		Sets the location hash to the supplied slide number.  This will
		clobber any existing hash.
		
		Parameters:
			slide - The slide number to which to set the hash
	*/
	function setHash(slide) {
		window.location.hash = '#' + slide;
	}
	
	/*
		Function: getHash
		
		Returns:
		the current location hash without the leading '#'
	*/
	function getHash() {
		var h = window.location.hash;
		return h.length > 1 && h[0] === '#' ? (Math.max(0, 1*h.substring(1))) : 0;
	}
	
	/*
		Function: stopEvent
		Prevents the default action and stops propagation of the supplied DOM event.
		
		Parameters:
			e - the event to stop
	*/
	function stopEvent(e) {
		e.preventDefault();
		e.stopPropagation();
	}
	
	// Add touch support hint, a la Modernizr, when dom is ready
	require('domReady!', function () {
		$('HTML').addClass(supportsTouch ? "touch" : "no-touch");
	});

	/*
		Function: initTouchEvents
		Sets up touch events for navigating slides
		
		Parameters:
			slideView - the <SlideView> on which to handle touch events
	*/
	function initTouchEvents(slideView) {
		// TODO: Should use the slide view's container, not body.
		$('body').on('touchstart', function (e) {
			var x = e.targetTouches[0].pageX,
				y = e.targetTouches[0].pageY,
				moved = false;

			$(this)
				.on('touchmove', function(e) {
					moved = true;
				})
				.on('touchend', function(e) {
					var ret = true;
					try {
						if(e.changedTouches.length === 1) {
							var next;

							if(moved) {
								var dx = e.changedTouches[0].pageX - x,
									dy = e.changedTouches[0].pageY - y;

								if(Math.abs(dx) > Math.abs(dy)) {
									stopEvent(e);
									next = dx <= 0;
								}

								ret = false;

							} else {
								// stopEvent(e);
								// next = e.changedTouches[0].pageX > (window.innerWidth/2);
							}

							if(next != undef) {
								setTimeout(function() {
									slideView[next ? 'next' : 'prev']().then(success);
								}, 0);
							}

						}

						return ret;

					} finally {
						moved = false;
						this.off('touchend');
						this.off('touchmove');
					}
				});

			return ret;
		});

	}
	
	/*
		Function: success
		Callback to be invoked on successful <SlideView> transtions, currently just
		updates the location hash by calling <setHash>
		
		Parameters:
			result - result provided by <SlideView>
	*/
	function success(result) {
		setHash(result.slide);
	}

	/*
		Function: PresentationController
		Creates a new PresentationController that will control a <SlideView>
		
		Parameters:
			slideView - the <SlideView> to control
			
		Returns:
		a new PresentationController
	*/
	return function PresentationController(slideView) {		
		$(window).on('keyup', function(e) {
			var key = (window.event) ? event.keyCode : e.keyCode,
				ret = true;
			switch(key) {
				case 37: // Left arrow
				// case 38: // Up arrow, used for keyboard scrolling
					slideView.prev().then(success);
					stopEvent(e);
					ret = false;
					break;
				case 32: // Space
				case 39: // Right arrow
				// case 40: // Down arrow, used for keyboard scrolling
					slideView.next().then(success);
					stopEvent(e);
					ret = false;
					break;
			}
			
			return ret;
		});
		
		// Goto first slide
		var promise = slideView.go(getHash()).then(function(result) {
			success(result);
		});
		
		if('onhashchange' in window) {
			$(window).on('hashchange', function(e) {
				slideView.go(getHash());
			});
		}
		
		if(supportsTouch) {
			initTouchEvents(slideView);
		}

		return promise;
	};
	
});
