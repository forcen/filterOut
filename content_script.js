if (window === top) {
    chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
        switch(req.op) {
            case 'init':
                sendResponse(processPage(req.config));
                break;
            case 'filter':
                sendResponse(filterOut(req.config));
                break;
        }
    });
}

// once the page is loaded I process the content
// to look for pieces
// 
var processPage = function(objConfig) {
        var objResult = {   // an object for historical reasons.
                            results: []
                        };

        // we call this same method at startup and when toggling
        if(objConfig.debug) {
            $('.filterout-debug').removeClass('filterout-debug');
        }
        $(objConfig.target).forEach(function(element){
            objResult.results.pushUnique(element.textContent.trim());
            if(objConfig.debug) {
                element.classList.add('filterout-debug');
                //element.style.outline="3px solid red";
            }
        });

        return objResult;
    },

    filterOut = function(objConfig) {

    };