// Global accessor used by the popup.
var strCurDomain = null;

function getDomainName (strURL) {
    var arrURL = strURL.split('/'),
        arrParts = arrURL[2].split(':'),
        arrDomain = arrParts[0].split('.');

    arrDomain.shift();

    return arrDomain.join('.');
}

// let's start slowly: where are we?
chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
    if (change.status == "complete") {
        strCurDomain = getDomainName(tab.url);
        updateAddress(tabId);
    }
});

chrome.tabs.query({active: true, currentWindow: true},
        function(tabs) {
            strCurDomain = getDomainName(tabs[0].url);
            updateAddress(tabs[0].id);
});


//console.log(getDomainName('http://www.pepe.com'))

//Test.assertEqual(getDomainName('http://www.pepe.com'), 'pepe.com');