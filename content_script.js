if (window == top) {
    chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
        sendResponse(findMatchesForDomain(req.url));
    });
}

// Search the nodes with the targets for this domain
var findMatchesForDomain = function(strURL) {

    alert(strURL);
    return;
};