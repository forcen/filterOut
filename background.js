// Global accessor used by the popup.
var strCurDomain = null;

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

/**
 * keep the strCurDomain param updated using this three methods
 */
chrome.windows.onFocusChanged.addListener(function (windowId) {
    chrome.tabs.getSelected(windowId, function (tab) {
        strCurDomain = getDomainName(tab.url);
    });
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
    if (change.status === "complete") {

    }
});


chrome.tabs.query({active: true, currentWindow: true},
    function(tabs) {
        strCurDomain = getDomainName(tabs[0].url);
   //     updateAddress(tabs[0].id);
});