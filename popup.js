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

        // fill results list
        if(arrResults.length) {
            arrResults.forEach(function(strTargetContent) {
                var elementContent = document.createTextNode(strTargetContent),
                    element = document.createElement('li');

                element.appendChild(elementContent);
                if(objConfig.filtered.contains(strTargetContent)) {
                    $(element).addClass('filterout-selected');
                }
                eleList.appendChild(element);
            });
        }

        // fill config panel
        $('#target').val(objConfig.target);
        $('#container').val(objConfig.container);
    }

    // event handler
    $('#results ul').on('click', function (e) {
        var element = e.target;

        if($(element).hasClass('filterout-selected')) {
            $(element).removeClass('filterout-selected');
        } else {
            $(element).addClass('filterout-selected');
        }

        objBackground.callToggleContent(strCurDomain, e.target.textContent);
    });

	// open config panel
	$('#btn_config').on('click', function () {
        $('#about').addClass('slideup').removeClass('slidedown');
		$('#config').addClass('slidedown').removeClass('slideup');
	});

    // open about panel
    $('#btn_about').on('click', function () {
        $('#config').addClass('slideup').removeClass('slidedown');
        $('#about').addClass('slidedown').removeClass('slideup');
    });

    // close config panel
	$('#btn_cancel').on('click', function () {
		$('#config').addClass('slideup').removeClass('slidedown');
	});

    // close config panel
    $('#btn_close').on('click', function () {
        $('#about').addClass('slideup').removeClass('slidedown');
    });

    // modify settings and reprocess
    $('#btn_save').on('click', function () {
        $('#config').addClass('slideup').removeClass('slidedown');

        objConfig.target = $('#target').val();
        objConfig.container = $('#container').val();

        // launch reprocessing
        objBackground.callContentScript();
    });
};