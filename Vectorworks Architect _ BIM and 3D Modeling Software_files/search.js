(function(window) {
	'use strict';

	if(document.getElementById('btnSearch')) {
        var openCtrl = document.getElementById('btnSearch'),
            closeCtrl = document.getElementById('btnSearchClose'),
            searchContainer = document.querySelector('.search'),
            searchTrigger = document.querySelector('.search-wrap'),
            utility = document.getElementById('utilityWrap'),
            inputSearch = searchContainer.querySelector('.search__input');

        init();
	}

	function init() {
		initEvents();	
	}

	function initEvents() {
		openCtrl.addEventListener('click', openSearch);
		closeCtrl.addEventListener('click', closeSearch);
		document.addEventListener('keyup', function(ev) {
			// escape key.
			if( ev.keyCode == 27 ) {
				closeSearch();
			}
		});
	}

	function openSearch() {
		searchContainer.classList.add('search-open');
		searchTrigger.classList.add('search-open');
		utility.classList.add('search-open-wrap');
		inputSearch.focus();
		document.ontouchmove = function(e){ e.preventDefault(); }
		$('body').addClass("no-scroll"); 
	}

	function closeSearch() {
		searchContainer.classList.remove('search-open');
		searchTrigger.classList.remove('search-open');
		utility.classList.remove('search-open-wrap');
		inputSearch.blur();
		inputSearch.value = '';
		$('body').removeClass("no-scroll");
		document.ontouchmove = function(e){ return true; }
	}

})(window);