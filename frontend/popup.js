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
    setProperty('#no_config', 'innerText', 'no_config');
    setProperty('#reload', 'innerText', 'reload');

    setProperty('.config_title', 'innerText', 'config_title');
    setProperty('.config_target label', 'innerText', 'config_target_label');
    setProperty('.config_target p', 'innerText', 'config_target_hint');
    setProperty('.config_container label', 'innerText', 'config_container_label');
    setProperty('.config_container p', 'innerText', 'config_container_hint');
    setProperty('.config_debug label', 'innerText', 'config_debug_label');

    setProperty('#btn_cancel', 'innerText', 'btnCancel');
    setProperty('#btn_save', 'innerText', 'btnSave');

    setProperty('#about p', 'innerText', 'about_text');
    setProperty('#btn_close', 'innerText', 'btnClose');
}

window.onload = function () {
    chrome.runtime.getBackgroundPage(function (backgroundPage) {
        filterOut = backgroundPage.getExtension();

console.warn(filterOut)

    const currentDomain = filterOut.getCurrentDomain() || chrome.i18n.getMessage('loading');
    const itemsToFilter = filterOut.getResults();
    const objResults = $('#results ul');
    const configuration = filterOut.getCurrentConfiguration();
    const elementsListContent = document.createDocumentFragment();

    $(".site_name").setText(currentDomain);
    loadI18nMessages();
    
    if(!configuration) {
        if(filterOut.getCurrentDomain()) {
            $('.no_config').show();
        }
    } else {
        $('.no_config').hide();

        // fill results list
        if(itemsToFilter.length) {
            itemsToFilter.forEach(function(strTargetContent) {
                var elementContent = document.createTextNode(strTargetContent),
                    element = document.createElement('li');

                element.appendChild(elementContent);
                if(configuration.filtered.contains(strTargetContent)) {
                    $(element).addClass('target-selected');
                }
                elementsListContent.appendChild(element);
            });
            objResults.first().appendChild(elementsListContent);
        }

        // fill config panel
        $('#target').val(configuration.target);
        $('#container').val(configuration.container);
        $('#debug').val(configuration.debug);
    }

    /**
     * event handlers
     */
    // list click handler
    $('#results ul').on('click', function (e) {
        var element = e.target;

        if($(element).hasClass('target-selected')) {
            $(element).removeClass('target-selected');
            $('#reload').show();
        } else {
            $(element).addClass('target-selected');
        }

        filterOut.callToggleContent(e.target.textContent);
    });

	// open config panel
	$('#btn_config').on('click', function () {
        if($('#about').hasClass('slidedown')) {
            $('#about').addClass('slideup').removeClass('slidedown');
		}
        $('#config').addClass('slidedown').removeClass('slideup');
	});

    // open about panel
    $('#btn_about').on('click', function () {
        if($('#config').hasClass('slidedown')) {
            $('#config').addClass('slideup').removeClass('slidedown');
        }
        $('#about').addClass('slidedown').removeClass('slideup');
    });

    // close config panel
	$('#btn_cancel').on('click', function () {
		$('#config').addClass('slideup').removeClass('slidedown');
	});

    // close about panel
    $('#btn_close').on('click', function () {
        $('#about').addClass('slideup').removeClass('slidedown');
    });

    // modify settings and reprocess
    $('#btn_save').on('click', function () {
        $('#config').addClass('slideup').removeClass('slidedown');
        $('.no_config').hide();

        filterOut.callSaveConfig($('#target').val(),
                                    $('#container').val(),
                                    $('#debug').val());
    });

    $('#reload').on('click', function () {
        filterOut.callReload();
    });
   });

};