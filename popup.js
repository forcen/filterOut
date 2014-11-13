/**
 * the popup is created new each time it opens. 
 * the only persistence is in the background code.
 */
window.onload = function () {
    var objBackground = chrome.extension.getBackgroundPage(),
        strCurDomain = objBackground.strCurDomain || 'Loading content...',
        arrResults = objBackground.arrResults[strCurDomain] || [],
        objResults = $('#results ul'),
        eleList = objResults.first(),
        objConfig = objBackground.objConfig[strCurDomain];

    $(".site_name").setText(strCurDomain);
    objResults.empty();
    
    if(!objConfig) {
        $('.no_config').show();
    } else {
        $('.no_config').hide();

        console.log(objConfig);

        if(arrResults.length) {
            arrResults.forEach(function(strTargetContent) {
                var elementContent = document.createTextNode(strTargetContent),
                    element = document.createElement('li');

                element.appendChild(elementContent);
                if(objConfig.filtered.contains(strTargetContent)) {
                    element.classList.add('filtered_out');
                }
                eleList.appendChild(element);
            });
        }
    }

    // event handler
    $('#results ul').on('click', function (e) {
        var element = e.target;

        if(element.classList.contains('filtered_out')) {
            element.classList.remove('filtered_out');
        } else {
            element.classList.add('filtered_out');
        }

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