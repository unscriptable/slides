/*
 	@license Copyright (c) 2011 Brian Cavalier
	LICENSE: see the LICENSE.txt file. If file is missing, this file is subject
	to the MIT License at: http://www.opensource.org/licenses/mit-license.php.
 */
/*
	Class: SlideView
*/
define(['jquery'], function($) {
	
	// OOCSS States for slides and slide container
	var slideDefaultState = 'slide',
		slideBeforeState = 'slide-before',
		slideAfterState = 'slide-after',
		slideCurrentState = 'slide-current',
		slideContainerIdentity = 'slide-view-module',
		slideContainerLoadingState = slideContainerIdentity + ' slide-view-loading',
		slideContainerTransitioningState = slideContainerIdentity + ' slide-transitioning',
		undef;
	
	/*
		Constructor: SlideView
		Creates a new SlideView
		
		Parameters:
			slideContainer - DomNode into which slides will be added
			slideModel - model that supplies slides via a get(slideNumber) function, such as <PresentationModel>
			
		Returns:
		a new SlideView
	*/
	return function SlideView(slideContainer, slideModel) {
		
		var current = -1,
			slides = [],
			container;
		
		/*
			Function: next
			Goes to the next slide, if one exists.
			
			Returns:
			a promise that will be resolved when the new slide has been displayed
		*/
		function next() {
			return go(current+1);
		}
		
		/*
			Function: prev
			Goes to the previous slide, if one exists.
			
			Returns:
			a promise that will be resolved when the new slide has been displayed
		*/
		function prev() {
			return go(current-1);
		}
		
		/*
			Function: reset
			Goes to the first slide
			
			Returns:
			a promise that will be resolved when the new slide has been displayed
		*/
		function reset() {
			return go(0);
		}
		
		/*
			Function: go
			Goes to the supplied slide number (zero-based index)
			
			Parameters:
				slide - number of the slide to go to

			Returns:
			a promise that will be resolved when the new slide has been displayed
		*/
		function go(slide) {
			var p = slideModel.get(slide);
			if(slide == current) {
				return p;
			} else if(slide < 0) {
				
			}
			
			function reject(num) {
				console.log("No such slide", num);
			}
			
			if(!slides[slide]) {
				// container.addClass(slideContainerTransitioningState);
				p.then(
					function(result) {
						addSlide(slide, result.content);
					},
					reject
				);
			} else {
				p.then(
					function() {
						transitionToSlide(slide);
					},
					reject
				);
			}
			
			return p;
		}
		
		function addSlide(slide, slideContent) {
			var holder;
			holder = $('<div></div>')
				.addClass(slide < current ? slideBeforeState : slideAfterState)
				.attr('id', slide)
				.html(slideContent);

			if(slide < current) {
				holder.insertBefore(slides[current]);
			} else {
				container.append(holder);
			}
			slides[slide] = holder[0];

			// Defer so DOM has a chance to add the new slide before we transition it
//			setTimeout(function() {
				transitionToSlide(slide);
//			}, 0);
		}
		
		function transitionToSlide(slide) {
			var dx = slide - current,
				prev = current;
				
			current = slide;
			
			$(slides[current]).attr('class', slideDefaultState).addClass(slideCurrentState);

			if (dx === -1 && dx === 1) {
				if (slides[prev]) {
					$(slides[prev]).attr('class', slideDefaultState).addClass(prev < current ? slideBeforeState : slideAfterState);
				}

			}
			else {
				for (var i = 0; i < slides.length; i++) {
					var slide = $(slides[i]);
					if (slide.length) {
						if (i < current) {
							slide.attr('class', slideDefaultState).addClass(slideBeforeState);
						} else if (i > current) {
							slide.attr('class', slideDefaultState).addClass(slideAfterState);
						}
					}
				}
				
			}
			
			// TODO: Need to listen for transitionend here for browsers that support it.
			container.addClass(slideContainerIdentity);
		}

		// Create a controlled container to hold slides
		container = $('<div></div>')
			.addClass(slideContainerLoadingState)
			.appendTo('BODY');
		$(slideContainer).html('').append(container);

		return {
			next: next,
			prev: prev,
			go: go,
			reset: reset
		};
	};

});
