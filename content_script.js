if (window === top) {
    chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
        sendResponse(processPage(req.url));
    });
}

// once the page is loaded I process the content
// to look for pieces
var objConfig =  {
        'eldiario.es': {
                        target: '.md-day-pinture-item .byline, .byline a',
                        container: ''
                    },
        'elconfidencial.com': {
                        target: 'span .signature',
                        container: ''
                    }
    },

    processPage = function(strURL) {
        var objResult = {
                            noconfig: true,
                            results: []
                        };

        if(objConfig[strURL]) {
            objResult.noconfig = false;

            $(objConfig[strURL].target).forEach(function(element){
                objResult.results.pushUnique(element.textContent.trim());
                // temp, for debugging purposes
                element.style.outline="3px solid red";
            });
        }
        return objResult;
    };