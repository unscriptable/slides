/*
 	@license Copyright (c) 2011 Brian Cavalier
	LICENSE: see the LICENSE.txt file. If file is missing, this file is subject
	to the MIT License at: http://www.opensource.org/licenses/mit-license.php.
 */

/*
	Class: PresentationModel
*/
define(['require', './Promise'], function(require, Promise) {
	
	var defaultSeparator = /\s*\<hr\s*\/?\>\s*|\s*----\s*/i;
	
	/*
		Constructor: PresentationModel
		Creates a new PresentationModel for accessing slides from separate HTML files
		named 0.html, 1.html, 2.html, etc.
		
		Parameters:
			slidePath - relative path to directory containing slide files
			preload - (optional) number of slides to preload initially, and as slides are viewed
		
		Returns:
		a new multi-file slide PresentationModel
	*/
	return function SingleFilePresentationModel(slidePath, separator) {
		
		var cachedSlides,
			loaded = false,
			resolveOnLoad = [];
			
		require(['text!' + slidePath], function(slideContent) {
			cachedSlides = slideContent.split(defaultSeparator);
			loaded = true;
			
			for (var i=0; i < resolveOnLoad.length; i++) {
				resolveOnLoad[i]();
			}
			
			resolveOnLoad = null;
		});
		
		return {
			/*
				Function: get
				Ensures that the supplied slide number is loaded, and returns a promise that
				will be resolved when the slide is ready.

				Parameters:
					slide - number of the slide to get
	
				Returns:
				a promise that will be resolved when the supplied slide number is loaded and ready.
				The promise value will have 2 fields:
					* slide - the slide number
					* content - the slide content
			*/
			get: function getSlide(slide) {
				var promise = new Promise();
				
				function resolveSlide() {
					if(0 <= slide && slide < cachedSlides.length) {
						promise.resolve({ slide: slide, content: cachedSlides[slide] });
					} else {
						promise.reject(slide);
					}
				}
				
				if(loaded) {
					resolveSlide();
				} else {
					resolveOnLoad.push(resolveSlide);
				}

				return promise.safe();
			}
		};
		
	};
});
