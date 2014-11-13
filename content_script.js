if (window === top) {
    chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
        switch(req.op) {
            case 'init':
                sendResponse(processPage(req.config));
                break;
            case 'toogle':
                sendResponse('');
                break;
        }
    });
}

// once the page is loaded I process the content
// to look for pieces
// 
var processPage = function(objConfig) {
        var objResult = {
                            noconfig: true,
                            results: []
                        };

        // not needed anymore. check before destroy and change objResult
        //objResult.noconfig = false;

        console.log(objConfig);
        
        // this part 
        $(objConfig.target).forEach(function(element){
            objResult.results.pushUnique(element.textContent.trim());
            if(objConfig.debug) {
                element.style.outline="3px solid red";
            }
        });

        return objResult;
    },

    filterContent = function() {

    };