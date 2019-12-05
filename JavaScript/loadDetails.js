/*
 * Netcraft Extension
 * loadDetails JavaScript
 */

// Ask for name and email
chrome.runtime.sendMessage({type: cons.reqDetails}, function(response) {
    $('input[name="name"]').val(response.name);
    $('input[name="email"]').val(response.email);
});
