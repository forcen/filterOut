/* global $, chrome */

'use strict';

// Global accessor used by the popup.
var strCurDomain = null,
    arrResults = {},
    // again, this will be refactored to use a local database
    objConfig =  {
        'eldiario.es': {
                        target: '.md-day-pinture-item .byline, .byline a',
                        container: '',
                        filtered: [],
                        debug: true
                    },
        'elconfidencial.com': {
                        target: 'span .signature',
                        container: '',
                        filtered: [],
                        debug: true
                    }
    };

function getDomainName (strURL) {
    var arrURL = strURL.split('/'),
        arrParts = arrURL[2].split(':'),
        arrDomain = arrParts[0].split('.');

    // assume it has a subdomain.
    if(arrDomain.length > 2) {
       arrDomain.shift();
    }

    return arrDomain.join('.');
}

function callContentScript (tabId) {
    chrome.tabs.sendMessage(tabId,
                            {
                                op: 'init',
                                config: objConfig[strCurDomain]
                            },
                            function(response) {
                                if(response) {
                                    arrResults[strCurDomain] = response.results ?
                                                                response.results.sort(function (a, b) { return a.localeCompare(b); }) :
                                                                [];
                                }
                            });
}

function toggleContent (strDomain, strContent) {

    if(objConfig[strDomain]) {//  modify the config for this domain
    objConfig[strDomain].filtered.toggle(strContent);

    console.log(objConfig[strDomain]);       

    // and re-process the page

    /*chrome.tabs.sendMessage(tabId,
                            {
                                op: 'toggle',
                                config: objConfig[strDomain]
                            },
                            function(response) {
                                
                            });
    */
}
}

/**
 * keep the strCurDomain param updated using this three methods
 */
chrome.windows.onFocusChanged.addListener(function (windowId) {
    if(windowId > -1) {
        chrome.tabs.getSelected(windowId, function (tab) {
            strCurDomain = getDomainName(tab.url);
        });
    }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        strCurDomain = getDomainName(tab.url);
    });
});

/**
 * this method, additionally, updates the list of content and
 * executes the filtering if there's any data stored for the url
 */
chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
    strCurDomain = getDomainName(tab.url);
    if (objConfig[strCurDomain] && change.status === "complete") {
        callContentScript(tabId);
    }
});

/*
chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
   callContentScript(tabs[0].id);
});
*/