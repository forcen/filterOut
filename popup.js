/**
 * the popup is created new each time it opens
 */
window.onload = function () {
    $(".site_name").setText(chrome.extension.getBackgroundPage().strCurDomain);

    $('#btn_about').on('click', function () {
        $('#results ul').empty();
    });

	// animation tests
	$('#btn_config').on('click', function () {
		$('#config').addClass('slidedown').removeClass('slideup');
	});

	$('#btn_cancel').on('click', function () {
		$('#config').addClass('slideup').removeClass('slidedown');
	});


};