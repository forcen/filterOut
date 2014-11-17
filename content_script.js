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
            }
        });

        return objResult;
    },

    filterOut = function(objConfig) {
        var arrFiltered = objConfig.filtered,
            arrTargets = objConfig.target.split(',');

        if(arrFiltered.length && objConfig.container) {
            $(objConfig.container).forEach(function(element){
                arrTargets.forEach(function (strTarget) {
                    var elemTarget = $(strTarget, element);

                    if(elemTarget.length && arrFiltered.contains($(elemTarget.first()).getText().trim())) {
                        element.remove();
                    }
                });
            });
        }
    };