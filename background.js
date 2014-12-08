/* global $, chrome, console, localStorage */

'use strict';

var 
objExtension = {

    strCurDomain: null,
    arrResults: {},
    objConfig: {},

    // local storage handling object
    objConfigHandler: {
        get: function (strDomain) {
            return JSON.parse(localStorage.getItem(strDomain));
        },

        set: function (strDomain, objConfig) {
            localStorage.setItem(strDomain, JSON.stringify(objConfig));
        }
    },

    /**
     * utils
     */

    /**
     * gets the domain part from the passed url
     * @param  {String}     a an url
     * @return {String}     just the domain part of the url
     */
    getDomainName: function (a) {
        a = a.split("/")[2].split(":")[0].split(".");
        2 < a.length && a.shift();  // jshint ignore: line
        this.strCurDomain = a.join(".");
    },

    /**
     * sets the number of possible targets in the badge
     * @param {Number} tabId restrict the change to current tab
     */
    setBadge: function (tabId) {
        chrome
            .browserAction
            .setBadgeText({
                            text: this.arrResults[this.strCurDomain] ?
                                    this.arrResults[this.strCurDomain].length.toString() :
                                    '0',
                            tabId: tabId
                        });
    },

    /**
     * returns strDomain or inits a new one
     * @param  {String} strDomain the domain
     * @return {object}           a properly configured config object
     */
    initConfig: function (strDomain) {
        return this.objConfigHandler
                    .get(strDomain) || {
                                            target: '',
                                            container: '',
                                            filtered: [],
                                            debug: true
                                        };
    },

    getCurConfig: function () {
        this.objConfig[this.strCurDomain] = this.objConfigHandler.get(this.strCurDomain);

        return this.objConfig[this.strCurDomain];
    },

    hasConfig: function () {
        return this.objConfig[this.strCurDomain] ? true : false;
    },

    getCurDomain: function () {
        return this.strCurDomain;
    },

    getResults: function () {
        return this.arrResults[this.strCurDomain] || [];
    },

    /**
     * this methods are called both from the inteface and as a reply
     * to chrome events
     */

    /**
     * save configuration when modified in popup
     * @param  {String} strDomain
     * @param  {String} strTarget
     * @param  {String} strContainer
     */
    callSaveConfig: function (strTarget, strContainer, boolDebug) {
        var strDomain = this.getCurDomain(),
            objLocalConfig = this.initConfig(strDomain);

        objLocalConfig.target = strTarget;
        objLocalConfig.container = strContainer;
        objLocalConfig.debug = boolDebug;

        this.objConfigHandler.set(strDomain, objLocalConfig);
        this.callFullProcess();   
    },

    /**
     * group both functions in one single call
     */
    callFullProcess: function() {
        this.callProcessPage();
        this.callFilterOut();
    },

    /**
     * launchs the processing of the page to get targets' content to filter out
     */
    callProcessPage: function () {
        var self = this;
        
        chrome.tabs.query({currentWindow: true, active: true},
                            function(tabs) {
                                self.doProcessPage(tabs[0].id, self.strCurDomain);
                            });
    },

    /**
     * launchs the real filtering ot the content
     */
    callFilterOut: function () {
        var self = this;

        chrome.tabs.query({currentWindow: true, active: true},
                            function(tabs) {
                                self.doFilterOut(tabs[0].id, self.strCurDomain);
                            });
    },

    /**
     * Just filter when the user selects a given content
     * 
     * @param  {String} strContent The content to add/remove to filtered Array
     */
    callToggleContent: function (strContent) {
        if(this.objConfig[this.strCurDomain]) {
            this.objConfig[this.strCurDomain].filtered.toggle(strContent);
            this.objConfigHandler.set(this.strCurDomain, this.objConfig[this.strCurDomain]);
            this.callFilterOut ();
        }
    },

    /**
     * reloads the page so the content unfiltered will be loaded again
     */
    callReload: function () {
        chrome.tabs.reload();
    },

    /**
     * calls the method that process the page and extracts possible targets
     * @param  tabId
     */
    doProcessPage: function (tabId) {
        var self = this;

        if(this.objConfig[this.strCurDomain]) {
            chrome
                .tabs
                .sendMessage(tabId,
                            {
                                op: 'init',
                                config: this.objConfig[this.strCurDomain]
                            },
                            function(response) {
                                if(response) {
                                    self.arrResults[self.strCurDomain] = response.results ?
                                                                response.results.sort(function (a, b) { return a.localeCompare(b); }) :
                                                                [];
                                    self.setBadge(tabId);
                                }
                            });
        }
    },

    /**
     * calls the method that filters the page based on targets, containers 
     * and filtered content.
     * @param  tabId
     */
    doFilterOut: function (tabId) {
        if(this.objConfig[this.strCurDomain]) {
            chrome
                .tabs
                .sendMessage(tabId,
                            {
                                op: 'filter',
                                config: this.objConfig[this.strCurDomain]
                            });
        }
    }
};

/**
 * the set of listeners that we need to be able to automatically 
 * process the pages when the user creates a window, reloads or activates a tab.
 */
chrome.windows.onFocusChanged.addListener(function (windowId) {
    if(windowId > -1) {
        chrome.tabs.getSelected(windowId, function (tab) {
            objExtension.getDomainName(tab.url);
            objExtension.setBadge(tab.id);
        });
    }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        objExtension.getDomainName(tab.url);
        objExtension.setBadge(tab.id);
    });
});

/**
 * this method, additionally, updates the list of content and
 * executes the filtering if there's any data stored for the url
 */
chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
    objExtension.getDomainName(tab.url);
    objExtension.setBadge();
    objExtension.getCurConfig();
    if (objExtension.hasConfig() && change.status === "complete") {
        objExtension.callFullProcess();
    }
});