/**
 * the popup is created new each time it opens. 
 * the only persistence is in the background code.
 */
function loadI18nMessages() {
    const setLabel = (selector, msg) => {
        const element = document.querySelector(selector);

        element && (element.innerText = chrome.i18n.getMessage(msg));
    };

    setLabel('title', 'popupTitle');
    setLabel('#btn_about', 'btnAbout');
    setLabel('#btn_config', 'btnConfig');
    setLabel('#no_config', 'no_config');
    setLabel('#reload', 'reload');

    setLabel('.config_title', 'config_title');
    setLabel('.config_target label', 'config_target_label');
    setLabel('.config_target p', 'config_target_hint');
    setLabel('.config_container label', 'config_container_label');
    setLabel('.config_container p', 'config_container_hint');
    setLabel('.config_debug label', 'config_debug_label');

    setLabel('#btn_cancel', 'btnCancel');
    setLabel('#btn_save', 'btnSave');

    setLabel('#about p', 'about_text');
    setLabel('#btn_close', 'btnClose');
}

window.onload = function() {
    chrome.runtime.getBackgroundPage(backgroundPage => {
        const filterOut = backgroundPage.getExtension();
        const domain = filterOut.getDomain() || chrome.i18n.getMessage('loading');
        const targets = filterOut.getTargets();
        const configuration = filterOut.getConfiguration();
        const elementsListContent = document.createDocumentFragment();

        $('.site_name').setText(domain);
        loadI18nMessages();

        if (!configuration) {
            $('.no_config').show();
        } else {
            if (targets.length) {
                targets.forEach(targetContent => {
                    const elementContent = document.createTextNode(targetContent);
                    const element = document.createElement('li');

                    element.appendChild(elementContent);
                    if (configuration.filtered.includes(targetContent)) {
                        $(element).addClass('target-selected');
                    }
                    elementsListContent.appendChild(element);
                });
                $('#results ul').first().appendChild(elementsListContent);
            }

            // fill config panel
            $('#target').value(configuration.target);
            $('#container').value(configuration.container);
            $('#debug').value(configuration.debug);
        }

        const openPane = pane => {
            $(pane).addClass('slidedown').removeClass('slideup');
        };

        const closePane = pane => {
            if ($(pane).hasClass('slidedown')) {
                $(pane).addClass('slideup').removeClass('slidedown');
            }
        };

        /**
         * event handlers
         */
        // list click handler
        $('#results ul').on('click', e => {
            const element = e.target;

            if ($(element).hasClass('target-selected')) {
                $(element).removeClass('target-selected');
                $('#reload').show();
            } else {
                $(element).addClass('target-selected');
            }

            filterOut.callToggleContent(e.target.textContent);
        });

        // open config panel
        $('#btn_config').on('click', () => {
            closePane('#about');
            openPane('#config');
        });

        // open about panel
        $('#btn_about').on('click', () => {
            closePane('#config');
            openPane('#about');
        });

        // close config panel
        $('#btn_cancel').on('click', () => {
            closePane('#config');
        });

        // close about panel
        $('#btn_close').on('click', () => {
            closePane('#about');
        });

        // modify settings and reprocess
        $('#btn_save').on('click', () => {
            closePane('#config');
            $('.no_config').hide();

            filterOut.callSaveConfig({
                target: $('#target').value(),
                container: $('#container').value(),
                debug: $('#debug').value(),
            });
        });

        $('#reload').on('click', () => {
            filterOut.callReload();
        });
    });
};