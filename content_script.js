if (window === top) {
    chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
        sendResponse(processPage(req.url));
    });
}


// once the page is loaded I process the content
// to look for pieces
var processPage = function(strURL) {
    var arrResults = [],
        strTarget = '.byline a';

    [].forEach.call($(strTarget), function(element){
        arrResults.pushUnique(element.textContent);
        element.style.outline="3px solid red";
    });

    console.log(arrResults);

    return arrResults;
};