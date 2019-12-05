// Netcraft Extension
// This script is called by blocked.html on load

// Must perform actions inside DOMContentLoaded, or else we'll get race
// conditions where we unsuccessfully manipulate the DOM before the browser
// finishes rendering it. That effectively results in a no-op where the browser
// shows an 'Unknown' block reason, and the buttons don't work.
document.addEventListener('DOMContentLoaded', ev => {

    // blocked.html is called with ?ref=N query string
    // where N is an index into the global phish array from background.js
    const ref = window.location.href.match(/\d+$/);

    // Ask background.js for information on the URL this page blocks
    // The callback function runs with the resulting information
    chrome.runtime.sendMessage({ type: cons.reqBlock, ref }, res => {

        // 'Visit anyway'
        document.getElementById('visit').addEventListener('click', ev => {
            // Tell the background script we want to force access to the url
            // for future requests
            // Then, show the url for this request
            chrome.runtime.sendMessage({ type: cons.reqForce, ref }, res => {
                window.location = res.url;
            });
        });

        const reportMistakeButton = document.getElementById('markSafe');
        reportMistakeButton.addEventListener('click', ev => {
            window.top.location.href = cons.reportMistake + res.url;
        });

        document.getElementById('url').textContent = 'Blocked URL: ' + res.url;

        const removeElement     = (el) => el.parentNode.removeChild(el);
        const hideMistakeButton = ()   => removeElement(reportMistakeButton);

        let reason = 'Unknown';
        switch (res.reason) {
            case cons.errPhish:
                reason = cons.msgPhish;
                break;

            case cons.errXSS:
                reason = cons.msgXSS;
                hideMistakeButton();
                break;

            case cons.errSuspicious:
                reason = cons.msgSuspicious;
                hideMistakeButton();
                break;
        }

        document.getElementById('reason').textContent = reason;
    });
});
