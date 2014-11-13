/**
 * the popup is created new each time it opens
 */
window.onload = function () {
    var objBackground = chrome.extension.getBackgroundPage(),
        strCurDomain = objBackground.strCurDomain ||'Loading content...',
        arrResults = objBackground.arrResults[strCurDomain] || [],
        objResults = $('#results ul'),
        eleList = objResults.first();

    $(".site_name").setText(strCurDomain);
    objResults.empty();
    
    if(arrResults.length) {
        $('.no_config').hide();
        arrResults.forEach(function(strTargetContent) {
            var elementContent = document.createTextNode(strTargetContent),
                element = document.createElement('li');

            element.appendChild(elementContent);
            eleList.appendChild(element);
        });
    } else {
        $('.no_config').show();
    }

    // event handler
    $('#results ul').on('click', function (e) {
        console.log(strCurDomain)
        objBackground.toggleContent(strCurDomain, e.target.textContent);
    });

	// config panel
	$('#btn_config').on('click', function () {
		$('#config').addClass('slidedown').removeClass('slideup');
	});

	$('#btn_cancel').on('click', function () {
		$('#config').addClass('slideup').removeClass('slidedown');
	});
};