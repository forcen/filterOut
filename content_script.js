/* globals window, document, top, chrome, $, MutationObserver */

/**
 * this is the script that has access to the content of the page.
 * it's invoked from the background.js 
 */

'use strict';

if (window === top) {
    chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
        switch(req.op) {
            case 'init':
                sendResponse(processPage(req.config));
                break;
            case 'filter':
                sendResponse(filterOut(req.config));
                break;
        }
    });
}

    /**
     * once the page is loaded I process the content
     * to look for articles or content based upon the target
     * passed in config
     *
     * @param {Object} objConfig Configuration for current domain
     */
var objLastConfig = null,
    processPage = function(objConfig) {
        var objResult = {   // an object for historical reasons.
                            results: []
                        };

        if(objConfig.debug) {
            $('.filterout-debug').removeClass('filterout-debug');
        }
        $(objConfig.target).forEach(function(element){
            objResult.results.pushUnique($(element).getText().trim());
            if(objConfig.debug) {
                $(element).addClass('filterout-debug');
            }
        });

        // mutation observer
        setObserver();
        objLastConfig = objConfig;

        return objResult;
    },

    /**
     * The filtering don't look parents from targets.
     * Instead looks for all possible containers and find targets
     * with a value that matches the filtered ones.
     * 
     * @param  {Object} objConfig Configuration for current domain
     */
    filterOut = function(objConfig, element) {
        var arrFiltered = objConfig.filtered,
            arrTargets = objConfig.target.split(',');

        if(arrFiltered.length && objConfig.container) {
            $(objConfig.container, element).forEach(function(element){
                arrTargets.forEach(function (strTarget) {
                    var elemTarget = $(strTarget, element);

                    if(elemTarget.length && arrFiltered.contains($(elemTarget.first()).getText().trim())) {
                        element.remove();
                    }
                });
            });
        }
    },

    filterElement = function (element) {
        if(objLastConfig) {
            filterOut(objLastConfig, element);
        }
    },

    setObserver= function () {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function (mutation) {
                if(mutation.addedNodes.length) {
                    filterElement(mutation.addedNodes[0]);
                }
            });              
        });

        observer.observe(document.body, { subtree: true, childList: true });
    };
