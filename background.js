function filterOut() {
    let currentDomain = null;
    const targets = {};
    const configuration = {};

    const getConfiguration = () => JSON.parse(localStorage.getItem(currentDomain));
    const setConfiguration = configuration => {
        localStorage.setItem(currentDomain, JSON.stringify(configuration));
    };

    const getDomain = () => currentDomain;
    const setDomain = url => currentDomain = getHostName(url);

    const getTargets = () => targets[currentDomain] || [];
    const setTargets = value => targets[currentDomain] = value;

    const hasConfiguration = () => getConfiguration() ? true : false;

    /**
     * Gets the host name from the passed url.
     *
     * @param  {String}     url an url
     *
     * @return {String}     just the domain part of the url
     */
    const getHostName = url => {
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
     * Sets the number of possible targets in the badge.
     *
     * @param {Number} tabId restrict the change to current tab
     */
    const setBadge = (tabId, numberOfTargets) => {
        chrome
            .browserAction
            .setBadgeText({
                tabId: tabId,
                text: numberOfTargets.toString() || '0',
            });
    };

    /**
     * Returns currentDomain configuration or inits a new one.
     *
     * @return {object}           a properly configured config object
     */
    const initConfiguration = () =>
        getConfiguration() || {
            target: '',
            container: '',
            filtered: [],
            debug: true,
        };

    /**
     * This methods are called both from the inteface and as a reply
     * to chrome events.
     */

    /**
     * Save configuration when modified from popup.
     * 
     * @param  {String} domain
     * @param  {String} target
     * @param  {String} container
     */
    const callSaveConfig = ({ target, container, debug }) => {
        setConfiguration({
            ...initConfiguration(),
            target,
            container,
            debug,
        });
        callFullProcess();
    };

    /**
     * Launchs the processing of the page to get targets' content to filter out.
     */
    const callProcessPage = () => {
        chrome.tabs.query({ currentWindow: true, active: true },
            tabs => {
                doProcessPage(tabs[0].id);
            });
    };

    /**
     * Launchs the real filtering ot the content.
     */
    const callFilterOut = () => {
        chrome.tabs.query({ currentWindow: true, active: true },
            tabs => {
                doFilterOut(tabs[0].id);
            });
    };

    /**
     * Groups both functions in one single call.
     */
    const callFullProcess = () => {
        callProcessPage();
        callFilterOut();
    };

    /**
     * Just filter when the user selects a given content
     * 
     * @param  {String} strContent The content to add/remove to filtered Array
     */
    const callToggleContent = strContent => {
        const configuration = getConfiguration();

        if (configuration) {
            configuration.filtered.toggle(strContent);
            setConfiguration(configuration);
            callFilterOut();
        }
    };

    /**
     * Reloads the page so the unfiltered content will be loaded again.
     */
    const callReload = () => {
        chrome.tabs.reload();
    };

    /**
     * Calls the method that process the page and extracts possible targets.
     *
     * @param  tabId
     */
    const doProcessPage = tabId => {
        const handleResponse = results => {
            if (results) {
                setTargets(results ?
                    results.sort((a, b) => a.localeCompare(b)) : []);
                setBadge(tabId, results.length);
            }
        };

        if (hasConfiguration()) {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                chrome.tabs.sendMessage(tabs[0].id, {
                        op: 'process',
                        config: getConfiguration(),
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
        if (hasConfiguration()) {
            chrome
                .tabs
                .sendMessage(tabId, {
                    op: 'filter',
                    config: getConfiguration(),
                });
        }
    };

    const onEventHandler = ({ url, id }) => {
        setDomain(url);

        callFullProcess(id);
    };

    const onTabUpdated = (tabId, change, tab) => {
        setDomain(tab.url);

        getConfiguration();
        if (hasConfiguration() && change.status === 'complete') {
            callFullProcess();
        }
    }

    return {
        callReload,
        callSaveConfig,
        callToggleContent,
        getConfiguration,
        getDomain,
        getTargets,
        onEventHandler,
        onTabUpdated,
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
        chrome.tabs.getSelected(windowId, extension.onEventHandler);
    }
});

chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, extension.onEventHandler);
});

/**
 * this method, additionally, updates the list of content and
 * executes the filtering if there's any data stored for the url
 */
chrome.tabs.onUpdated.addListener(extension.onTabUpdated);
