/* global $, chrome */

'use strict';

// Global accessor used by the popup.
var strCurDomain = null,
    arrResults = {},
    // again, this will be refactored to use a local database
    objConfig =  {
        'eldiario.es': {
                        target: '.md-day-pinture-item .byline, .byline a',
                        container: '.md-news-main',
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

function doContentScript (tabId, strDomain) {
    chrome.tabs.sendMessage(tabId,
                            {
                                op: 'init',
                                config: objConfig[strDomain]
                            },
                            function(response) {
                                if(response) {
                                    arrResults[strDomain] = response.results ?
                                                                response.results.sort(function (a, b) { return a.localeCompare(b); }) :
                                                                [];
                                }
                            });
}

function callContentScript () {
    chrome.tabs.query({currentWindow: true, active: true},
                        function(tabs) {
                            doContentScript(tabs[0].id, strCurDomain);
                        });
}

function doToggleContent (tabId, strDomain, strContent) {
    objConfig[strDomain].filtered.toggle(strContent);

    chrome.tabs.sendMessage(tabId,
                            {
                                op: 'filter',
                                config: objConfig[strDomain]
                            },
                            function(response) {
                                
                            });
}

function callToggleContent (strDomain, strContent) {
    if(objConfig[strDomain]) {//  modify the config for this domain
        chrome.tabs.query({currentWindow: true, active: true},
                            function(tabs) {
                                doToggleContent(tabs[0].id, strDomain, strContent);
                            });
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
        callToggleContent(tabId);
    }
});

/**
 * call on loading the page for the first time
 */
chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
   callContentScript(tabs[0].id);
   callToggleContent(tabs[0].id);
});