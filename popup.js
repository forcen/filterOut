/**
 * the popup is created new each time it opens. 
 * the only persistence is in the background code.
 */

function loadI18nMessages() {
    function setProperty(selector, prop, msg) {
        document.querySelector(selector)[prop] = chrome.i18n.getMessage(msg);
    }

    setProperty('title', 'innerText', 'popupTitle');
    setProperty('#btn_about', 'innerText', 'btnAbout');
    setProperty('#btn_config', 'innerText', 'btnConfig');
    setProperty('.no_config', 'innerText', 'no_config');

    setProperty('.config_title', 'innerText', 'config_title');
    setProperty('.config_target label', 'innerText', 'config_target_label');
    setProperty('.config_target p', 'innerText', 'config_target_hint');
    setProperty('.config_container label', 'innerText', 'config_container_label');
    setProperty('.config_container p', 'innerText', 'config_container_hint');

    setProperty('#btn_cancel', 'innerText', 'btnCancel');
    setProperty('#btn_save', 'innerText', 'btnSave');

    setProperty('#about p', 'innerText', 'about_text');
    setProperty('#btn_close', 'innerText', 'btnSave');
}

window.onload = function () {
    var objBackground = chrome.extension.getBackgroundPage(),
        strCurDomain = objBackground.strCurDomain || 'Loading content...',
        arrResults = objBackground.arrResults[strCurDomain] || [],
        objResults = $('#results ul'),
        eleList = objResults.first(),
        objConfig = objBackground.objConfig[strCurDomain];

    $(".site_name").setText(strCurDomain);
    loadI18nMessages();
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
        objBackground.callFullProcess();
    });
};