/*
 * Netcraft Extension
 * options page JavaScript
 */

// Simply load current options from local storage and save on each edit
$(function() {
    $('input').each(function(i, e) {
        if($(this).attr("type") == "text") {
            $(this).val(localStorage[$(this).attr("id")]);
            $(this).keyup(function() {
                localStorage[$(this).attr("id")] = $(this).val();
            });
        } else {
            if(localStorage[$(this).attr("id")] === 'true')
                $(this).prop("checked", true); 
            $(this).click(function() {
                localStorage[$(this).attr("id")] = $(this).is(':checked');
            });
        }
    });
});
