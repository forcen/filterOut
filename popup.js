/**
 * the popup is created new each time it opens
 */
window.onload = function () {

    debugger
    
    var arrResults = chrome.extension.getBackgroundPage().arrResults,
        objResults = $('#results ul');

    $(".site_name").setText(chrome.extension.getBackgroundPage().strCurDomain);
    objResults.empty();
    
    arrResults.forEach(function(strTargetContent) {
        objResults.append('<li>' + strTargetContent + '</li>');
    });


	// animation tests
	$('#btn_config').on('click', function () {
		$('#config').addClass('slidedown').removeClass('slideup');
	});

	$('#btn_cancel').on('click', function () {
		$('#config').addClass('slideup').removeClass('slidedown');
	});


};