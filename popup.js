/**
 * the popup is created new each time it opens
 */
window.onload = function () {
    var strCurDomain = chrome.extension.getBackgroundPage().strCurDomain ||'Loading content...',
        arrResults = chrome.extension.getBackgroundPage().arrResults[strCurDomain] || [],
        objResults = $('#results ul'),
        eleList = objResults.first();

    $(".site_name").setText(strCurDomain);
    objResults.empty();
    
    if(arrResults.length) {
        arrResults.forEach(function(strTargetContent) {
            var elementContent = document.createTextNode(strTargetContent),
                element = document.createElement('li');

            element.appendChild(elementContent);
            eleList.appendChild(element);
        });
    }

    // event handler
    $('#results ul').on('click', function (e) {
        console.log(e.target.textContent);
    });

	// config panel
	$('#btn_config').on('click', function () {
		$('#config').addClass('slidedown').removeClass('slideup');
	});

	$('#btn_cancel').on('click', function () {
		$('#config').addClass('slideup').removeClass('slidedown');
	});
};