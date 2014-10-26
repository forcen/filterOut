

window.onload = function () {
    /*
    var elHeader = document.getElementsByTagName("header");
    elHeader[0].innerHTML = chrome.extension.getBackgroundPage().strCurDomain;
	*/

	// animation tests
	document.querySelector('#btn_config').addEventListener('click', function () {
		var element = document.querySelector('#config');
			element.classList.add('slidedown');
			element.classList.remove('slideup');
	});

	document.querySelector('#btn_cancel').addEventListener('click', function () {
		var element = document.querySelector('#config');
			element.classList.add('slideup');
			element.classList.remove('slidedown');
	});
};