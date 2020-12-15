/* globals window, document, top, chrome, $, MutationObserver */

/**
 * This is the script that has access to the content of the page.
 * It's invoked from the background.js 
 */

'use strict';

if (window === top) { 
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        debugger
        switch(request.op) {
            case 'init':
                sendResponse(processPage(request.config));
                break;
            case 'filter':
                sendResponse(filterOut(request.config));
                break;
        }
    });
}

/**
 * Once the page is loaded I process the content
 * to look for articles or content based upon the target
 * passed in config.
 *
 * @param {Object} currentConfiguration Configuration for current domain
 */
let currentConfiguration = null;

const processPage = function(configuration) {
    var results = [];

    if(configuration.debug) {
        $('.filterout-debug').removeClass('filterout-debug');
    }
    $(configuration.target).forEach(function(element){
        results.pushUnique($(element).getText().trim());
        if(configuration.debug) {
            $(element).addClass('filterout-debug');
        }
    });

    // mutation observer
    setObserver();
    currentConfiguration = configuration;

    return results;
};

/**
 * The filtering don't look parents from targets.
 * Instead looks for all possible containers and find targets
 * with a value that matches the filtered ones.
 * 
 * @param  {Object} configuration Configuration for current domain
 */
const filterOut = function(configuration, element) {
    const filteredElements = configuration.filtered;
    const targets = configuration.target.split(',');

    if(filteredElements.length && configuration.container) {
        $(configuration.container, element).forEach(function(element){
            targets.forEach(function (target) {
                const targetElement = $(target, element);

                if(targetElement.length && filteredElements.contains($(targetElement.first()).getText().trim())) {
                    element.remove();
                }
            });
        });
    }
};

const filterElement = function (element) {
    if(currentConfiguration) {
        filterOut(currentConfiguration, element);
    }
};

const setObserver= function () {
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function (mutation) {
            if(mutation.addedNodes.length) {
                filterElement(mutation.addedNodes[0]);
            }
        });              
    });

    observer.observe(document.body, { subtree: true, childList: true });
};
