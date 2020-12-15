/* global $, chrome, console, localStorage */

'use strict';

const filterOut = {

    currentDomain: null,
    itemsToFilter: {},
    configuration: {},

    // local storage handling object
    configurationHandler: {
        get: function (domain) {
            return JSON.parse(localStorage.getItem(domain));
        },

        set: function (domain, configuration) {
            localStorage.setItem(domain, JSON.stringify(configuration));
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
    getDomainName: function (url) {
        var hostname;
        //find & remove protocol (http, ftp, etc.) and get hostname

        if (url.indexOf("//") > -1) {
            hostname = url.split('/')[2];
        }
        else {
            hostname = url.split('/')[0];
        }

        //find & remove port number
        hostname = hostname.split(':')[0];
        //find & remove "?"
        hostname = hostname.split('?')[0];

        return hostname;
    },

    /**
     * sets the number of possible targets in the badge
     * @param {Number} tabId restrict the change to current tab
     */
    setBadge: function (tabId) {
        chrome
            .browserAction
            .setBadgeText({
                            text: this.itemsToFilter[this.currentDomain] ?
                                    this.itemsToFilter[this.currentDomain].length.toString() :
                                    '0',
                            tabId: tabId
                        });
    },

    /**
     * returns domain or inits a new one
     * @param  {String} domain the domain
     * @return {object}           a properly configured config object
     */
    initConfig: function (domain) {
        return this.configurationHandler
                    .get(domain) || {
                                        target: '',
                                        container: '',
                                        filtered: [],
                                        debug: true
                                    };
    },

    getCurrentConfiguration: function () {
        this.configuration[this.currentDomain] = this.configurationHandler.get(this.currentDomain);

        return this.configuration[this.currentDomain];
    },

    hasConfig: function () {
        return this.configuration[this.currentDomain] ? true : false;
    },

    getCurrentDomain: function () {
        return this.currentDomain;
    },

    getResults: function () {
        return this.itemsToFilter[this.currentDomain] || [];
    },

    /**
     * this methods are called both from the inteface and as a reply
     * to chrome events
     */

    /**
     * save configuration when modified in popup
     * @param  {String} domain
     * @param  {String} target
     * @param  {String} container
     */
    callSaveConfig: function (target, container, debug) {
        const domain = this.getCurrentDomain();
        const localConfiguration = this.initConfig(domain);

        localConfiguration.target = target;
        localConfiguration.container = container;
        localConfiguration.debug = debug;

        this.configurationHandler.set(domain, localConfiguration);
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
                                self.doProcessPage(tabs[0].id, self.currentDomain);
                            });
    },

    /**
     * launchs the real filtering ot the content
     */
    callFilterOut: function () {
        var self = this;

        chrome.tabs.query({currentWindow: true, active: true},
                            function(tabs) {
                                self.doFilterOut(tabs[0].id, self.currentDomain);
                            });
    },

    /**
     * Just filter when the user selects a given content
     * 
     * @param  {String} strContent The content to add/remove to filtered Array
     */
    callToggleContent: function (strContent) {
        if(this.configuration[this.currentDomain]) {
            this.configuration[this.currentDomain].filtered.toggle(strContent);
            this.configurationHandler.set(this.currentDomain, this.configuration[this.currentDomain]);
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

        if(this.configuration[this.currentDomain]) {
            chrome
                .runtime
                .sendMessage(tabId,
                            {
                                op: 'init',
                                config: this.configuration[this.currentDomain]
                            },
                            function(response) {
                                if(response) {
                                    self.itemsToFilter[self.currentDomain] = response.results ?
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
        if(this.configuration[this.currentDomain]) {
            chrome
                .runtime
                .sendMessage(tabId,
                            {
                                op: 'filter',
                                config: this.configuration[this.currentDomain]
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
            filterOut.currentDomain = filterOut.getDomainName(tab.url);
            filterOut.setBadge(tab.id);
        });
    }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tab.get(activeInfo.tabId, function (tab) {
        filterOut.currentDomain = filterOut.getDomainName(tab.url);
        filterOut.setBadge(tab.id);
    });
});

/**
 * this method, additionally, updates the list of content and
 * executes the filtering if there's any data stored for the url
 */
chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
    filterOut.currentDomain = filterOut.getDomainName(tab.url);
    filterOut.setBadge();
    filterOut.getCurrentConfiguration();
    if (filterOut.hasConfig() && change.status === "complete") {
        filterOut.callFullProcess();
    }
});

function getExtension() {
    return filterOut;
}