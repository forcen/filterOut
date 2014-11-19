/* global $, chrome, console, localStorage */

'use strict';

// Global accessor used by the popup.
var strCurDomain = null,
    arrResults = {},
    objConfig = {},

    // local storage handling object
    objConfigHandler = {
        get: function (strDomain) {
            return JSON.parse(localStorage.getItem(strDomain));
        },

        set: function (strDomain, objConfig) {
            localStorage.setItem(strDomain, JSON.stringify(objConfig));
        }
    };

/**
 * utils
 */

/**
 * gets the domain part from the passed url
 * @param  {String}     a an url
 * @return {String}     just the domain part of the url
 */
function getDomainName(a) {
    a = a.split("/")[2].split(":")[0].split(".");
    2 < a.length && a.shift();  // jshint ignore: line
    return a.join(".");
}

/**
 * sets the number of possible targets in the badge
 * @param {Number} tabId restrict the change to current tab
 */
function setBadge (tabId) {
    chrome.browserAction
                .setBadgeText({
                                text: arrResults[strCurDomain]
                                        ? arrResults[strCurDomain].length.toString() // jshint ignore: line
                                        : '0',
                                tabId: tabId
                            });
}

/**
 * returns strDomain or inits a new one
 * @param  {String} strDomain the domain
 * @return {object}           a properly configured config object
 */
function initConfig(strDomain) {
    return objConfigHandler.get(strDomain) || {
                                                    target: '',
                                                    container: '',
                                                    filtered: [],
                                                    debug: true
                                                };
}

/**
 * isolate objConfigHandler from popup
 * @param  {String} strDomain
 * @param  {Object} objConfig 
 */
function saveConfig(strDomain, objConfig) {
    objConfigHandler.set(strDomain, objConfig);
}

/**
 * this methods are called both from the inteface and as a reply
 * to chrome events
 */

/**
 * group both functions in one single call
 */
function callFullProcess() {
    callProcessPage();
    callFilterOut();
}

/**
 * launchs the processing of the page to get targets' content to filter out
 */
function callProcessPage () {
    chrome.tabs.query({currentWindow: true, active: true},
                        function(tabs) {
                            doProcessPage(tabs[0].id, strCurDomain);
                        });
}

/**
 * launchs the real filtering ot the content
 */
function callFilterOut () {
    chrome.tabs.query({currentWindow: true, active: true},
                        function(tabs) {
                            doFilterOut(tabs[0].id, strCurDomain);
                        });
}

/**
 * Just filter when the user selects a given content
 * 
 * @param  {String} strContent The content to add/remove to filtered Array
 */
function callToggleContent (strContent) {
    if(objConfig[strCurDomain]) {
        objConfig[strCurDomain].filtered.toggle(strContent);
        callFilterOut ();
    }
}

/**
 * calls the method that process the page and extracts possible targets
 * @param  tabId
 */
function doProcessPage (tabId) {
    if(objConfig[strCurDomain]) {
        chrome.tabs.sendMessage(tabId,
                                {
                                    op: 'init',
                                    config: objConfig[strCurDomain]
                                },
                                function(response) {
                                    var numTargets;

                                    if(response) {
                                        numTargets = response.results ? response.results.length : 0;
                                        arrResults[strCurDomain] = response.results ?
                                                                    response.results.sort(function (a, b) { return a.localeCompare(b); }) :
                                                                    [];
                                        setBadge(tabId);
                                    }
                                });
    }
}

/**
 * calls the method that filters the page based on targets, containers 
 * and filtered content.
 * @param  tabId
 */
function doFilterOut (tabId) {
    if(objConfig[strCurDomain]) {
        chrome.tabs.sendMessage(tabId,
                                {
                                    op: 'filter',
                                    config: objConfig[strCurDomain]
                                });
    }
}

/**
 * the set of listeners that we need to be able to automatically 
 * process the pages when the user creates a window, reloads or activates a tab.
 */
chrome.windows.onFocusChanged.addListener(function (windowId) {
    if(windowId > -1) {
        chrome.tabs.getSelected(windowId, function (tab) {
            strCurDomain = getDomainName(tab.url);
            setBadge(tab.id);
        });
    }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        strCurDomain = getDomainName(tab.url);
        setBadge(tab.id);
    });
});

/**
 * this method, additionally, updates the list of content and
 * executes the filtering if there's any data stored for the url
 */
chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
    strCurDomain = getDomainName(tab.url);
    setBadge();
    objConfig[strCurDomain] = objConfigHandler.get(strCurDomain);
    if (objConfig[strCurDomain] && change.status === "complete") {
        callFullProcess();
    }
});