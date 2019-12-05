/*
 * Netcraft Extension
 * check JavaScript
 */

// Checks the current tab url to see if all is OK
function check() {
    // Ask background page to check url
    chrome.runtime.sendMessage(
            {type: cons.reqCheck, url: document.URL}, function(res) {
        // If something has gone wrong
        if(res.status !== cons.noError) {
            // If phish or XSS or Suspicious
            if(res.status === cons.errPhish || res.status === cons.errXSS || res.status === cons.errSuspicious)
                window.location = chrome.runtime.getURL(cons.block + res.ref);
            // Else set appropriate message
            else if(res.status === cons.errNoInfo) setDanger(cons.msgNoInfo);
            else setDanger(cons.msgNoServer);
        }
    });
}

// Sends message to set the danger icon
function setDanger(msg) {
    chrome.runtime.sendMessage({type: cons.reqDanger, msg: msg}, 
        function(res) {});
}

// Check the current URL
check();
