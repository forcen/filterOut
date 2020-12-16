/**
 * This is the script that has access to the content of the page.
 * It's invoked from the background.js 
 */

/**
 * Once the page is loaded I process the content
 * to look for articles or content based upon the target
 * passed in config.
 *
 * @param {Object} configuration Configuration for current domain
 */
const processPage = configuration => {
    const results = [];

    configuration.debug && $('.filterout-debug').removeClass('filterout-debug');

    $(configuration.target).forEach(element => {
        results.pushUnique($(element).getText().trim());
        configuration.debug && $(element).addClass('filterout-debug');
    });

    setObserver(configuration);

    return results;
};

/**
 * The filtering don't look parents from targets.
 * Instead looks for all possible containers and find targets
 * with a value that matches the filtered ones.
 * 
 * @param  {Object} configuration   Configuration for current domain.
 * @param  {Object} element         optional to start the filter from.
 */
const filterOut = (configuration, element) => {
    const filteredElements = configuration.filtered;
    const targets = configuration.target.split(',');

    if (filteredElements.length && configuration.container) {
        $(configuration.container, element).forEach(element => {
            targets.forEach(target => {
                const targetElement = $(target, element);

                if (targetElement.length && filteredElements.includes($(targetElement.first()).getText().trim())) {
                    element.remove();
                }
            });
        });
    }
};

/**
 * Setup a Mutation Observer to filter newly added elements.
 */
const setObserver = configuration => {
    const filterElement = element => {
        if (configuration) {
            filterOut(configuration, element);
        }
    };

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                filterElement(mutation.addedNodes[0]);
            }
        });
    });

    observer.observe(document.body, { subtree: true, childList: true, });
};

/**
 * Setup message listener
 */
if (window === top) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        switch (request.op) {
        case 'process':
            sendResponse(processPage(request.config));
            break;
        case 'filter':
            sendResponse(filterOut(request.config));
            break;
        }
    });
}