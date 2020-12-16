function filterOut() {
    let currentDomain = null;
    const itemsToFilter = {};
    const configuration = {};

    const configurationHandler = {
        get: domain => JSON.parse(localStorage.getItem(domain)),

        set: (domain, configuration) => {
            localStorage.setItem(domain, JSON.stringify(configuration));
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
    const getDomainName = url => {
        let hostname;

        if (url.indexOf("//") > -1) {
            hostname = url.split('/')[2];
        } else {
            hostname = url.split('/')[0];
        }

        hostname = hostname.split(':')[0];
        hostname = hostname.split('?')[0];

        return hostname;
    };

    /**
     * sets the number of possible targets in the badge
     * @param {Number} tabId restrict the change to current tab
     */
    const setBadge = tabId => {
        chrome
            .browserAction
            .setBadgeText({
                text: itemsToFilter[currentDomain] ?
                    itemsToFilter[currentDomain].length.toString() : '0',
                tabId: tabId
            });
    };

    /**
     * returns domain or inits a new one
     * @param  {String} domain the domain
     * @return {object}           a properly configured config object
     */
    const initConfiguration = domain =>
        configurationHandler
        .get(domain) || {
            target: '',
            container: '',
            filtered: [],
            debug: true
        };

    const getCurrentConfiguration = () => {
        configuration[currentDomain] = configurationHandler.get(currentDomain);

        return configuration[currentDomain];
    };

    const hasConfig = () => configuration[currentDomain] ? true : false;

    const getCurrentDomain = () => currentDomain;

    const getResults = () => itemsToFilter[currentDomain] || [];

    /**
     * this methods are called both from the inteface and as a reply
     * to chrome events
     */

    /**
     * Save configuration when modified from popup.
     * 
     * @param  {String} domain
     * @param  {String} target
     * @param  {String} container
     */
    const callSaveConfig = (target, container, debug) => {
        const domain = getCurrentDomain();

        console.log(initConfiguration(domain));
        configurationHandler.set(domain, {
            ...initConfiguration(domain),
            target,
            container,
            debug,
        });
        callFullProcess();
    };

    /**
     * group both functions in one single call
     */
    const callFullProcess = () => {
        callProcessPage();
        callFilterOut();
    };

    /**
     * launchs the processing of the page to get targets' content to filter out
     */
    const callProcessPage = () => {
        chrome.tabs.query({ currentWindow: true, active: true },
            tabs => {
                doProcessPage(tabs[0].id);
            });
    };

    /**
     * launchs the real filtering ot the content
     */
    const callFilterOut = () => {
        chrome.tabs.query({ currentWindow: true, active: true },
            tabs => {
                doFilterOut(tabs[0].id);
            });
    };

    /**
     * Just filter when the user selects a given content
     * 
     * @param  {String} strContent The content to add/remove to filtered Array
     */
    const callToggleContent = strContent => {
        if (configuration[currentDomain]) {
            configuration[currentDomain].filtered.toggle(strContent);
            configurationHandler.set(currentDomain, configuration[currentDomain]);
            callFilterOut();
        }
    };

    /**
     * reloads the page so the content unfiltered will be loaded again
     */
    const callReload = () => {
        chrome.tabs.reload();
    };

    /**
     * calls the method that process the page and extracts possible targets
     * @param  tabId
     */
    const doProcessPage = tabId => {
        const handleResponse = response => {
            if (response) {
                itemsToFilter[currentDomain] = response.results ?
                    response.results.sort((a, b) => a.localeCompare(b)) : [];
                setBadge(tabId);
            }
        };

        if (configuration[currentDomain]) {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                chrome.tabs.sendMessage(tabs[0].id, {
                        op: 'init',
                        config: configuration[currentDomain]
                    },
                    handleResponse);
            });
        }
    };

    /**
     * calls the method that filters the page based on targets, containers 
     * and filtered content.
     */
    const doFilterOut = tabId => {
        if (configuration[currentDomain]) {
            chrome
                .runtime
                .sendMessage({
                    op: 'filter',
                    config: configuration[currentDomain]
                });
        }
    };

    const onFocusChanged = ({ url, id }) => {
        currentDomain = getDomainName(url);
        setBadge(id);
    };

    const onActivated = ({ url, id }) => {
        currentDomain = getDomainName(url);
        setBadge(id);
    };

    const onUpdated = (tabId, change, tab) => {
        currentDomain = getDomainName(tab.url);
        setBadge(tabId);
        getCurrentConfiguration();
        if (hasConfig() && change.status === 'complete') {
            callFullProcess();
        }
    };

    return {
        callReload,
        callSaveConfig,
        callToggleContent,
        getCurrentConfiguration,
        getCurrentDomain,
        getResults,
        hasConfig,
        onFocusChanged,
        onActivated,
    }
};

const extension = filterOut();

// Make the extension accesible to the frontend.
function getExtension() {
    return extension;
}

/**
 * the set of listeners that we need to be able to automatically 
 * process the pages when the user creates a window, reloads or activates a tab.
 */
chrome.windows.onFocusChanged.addListener(windowId => {
    if (windowId > -1) {
        chrome.tabs.getSelected(windowId, extension.onFocusChanged);
    }
});

chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, extension.onActivated);
});

/**
 * this method, additionally, updates the list of content and
 * executes the filtering if there's any data stored for the url
 */
chrome.tabs.onUpdated.addListener(extension.onUpdated);