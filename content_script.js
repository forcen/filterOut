if (window === top) {
    chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
        sendResponse(processPage(req.url));
    });
}

// once the page is loaded I process the content
// to look for pieces
// 
// this will be refactored: all config info must be in background.js
// and here I only get the object for the url in the tab, instead of the url
var objConfig =  {
        'eldiario.es': {
                        target: '.md-day-pinture-item .byline, .byline a',
                        container: '',
                        filtered: [],
                        debug: true
                    },
        'elconfidencial.com': {
                        target: 'span .signature',
                        container: '',
                        filtered: [],
                        debug: true
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
                if(objConfig[strURL].debug) {
                    element.style.outline="3px solid red";
                }
            });
        }
        return objResult;
    };