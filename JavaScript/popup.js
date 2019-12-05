/*
 * Netcraft Extension
 * popup page JavaScript
 */

 var transitionTime = 400; //ms


//---------------
// Initialisation
// (run when this script loads)

// Request info from background script
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var total_timer = new TrackTiming(cons.gaCategory,'Click-to-completion');
    total_timer.start();

    //debug
    //chrome.runtime.sendMessage({type: cons.reqPrintTimingData,
    //                             eventName: 'Popup requested'});

    var loadingTimeout = setTimeout(displayLoadingPlaceholders, 300);

    var curTime = new Date().getTime();
    var messageObject = {
        type: cons.reqPopUp,
        url: tabs[0].url,
        messageStartTime: curTime //start of popup->background message
    };
    chrome.runtime.sendMessage(messageObject, function(res) {
        var popup_res_message_timer
            = new TrackTiming(cons.gaCategory,
                              'Popup response message transfer',
                              undefined,
                              res.messageStartTime); //start of background -> popup message
        popup_res_message_timer.stop().send();

        var popupjs_processing_timer
            = new TrackTiming(cons.gaCategory,'popup.js popup display processing');
        popupjs_processing_timer.start();

        clearTimeout(loadingTimeout);

        var info = $.parseJSON(res.info);
        var link = document.createElement('a');
        link.href = res.url;
        var RR = info.risk;

        browser.runtime.sendMessage({"actualMessage":"some message"});

        displayHostname(link.hostname);
        // No site info available, clear pop up
        if(info === cons.errNoInfo) clearPopup();
        else { // Display all site info
            displayRiskRating(info);
            displayCountryFlag(info.country.toLowerCase());

            // Change display format of information
            info.rank = numberWithCommas(info.rank);
            if(info.rank == "")      info.rank      = cons.msgNa;
            if(info.firstseen == "") info.firstseen = cons.msgNewSite;
            // If these fields are too long they split onto multiple lines,
            // which messes up the height of the popup box
            // (i.e. changes height with no slide, so looks ugly/jarring)
            if(info.hoster.length > 15)
                info.hoster = info.hoster.substring(0, 12) + "...";
            if(info.firstseen.length > 12)
                info.firstseen = info.firstseen.replace(/^(...)\S*\b/, "$1");

            displaySiteInfo(info);

            // Link addresses need to be set after they're created
            // by displaySiteInfo > checkAndDisplaySSLInfo
            setLinkAddresses(link, info);

            // Setup controllers
            $('#flag').on('error', function() { $(this).remove(); });
            $('#reportPhish').click(function() {
                window.open(cons.reportPhish + tabs[0].url);
            });

            // Remove report phish button if viewing a phish
            if(res.block) $('#reportPhish').remove();

            popupjs_processing_timer.stop().send();
            total_timer.stop().send();

            //debug
            //var total_time = total_timer.getTime();
            //chrome.runtime.sendMessage({type: cons.reqPrintTimingData,
            //                              eventName: 'Popup request',
            //                              duration: total_time });

        }
    });
});

// Close pop up if any tab is closed
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    window.close();
});


//---------------
// Utility Functions

function displayLoadingPlaceholders() {
    transitionTime *= 2;
    $('h1').animate({opacity: 1}, transitionTime / 2);
}

function displayHostname(domain_name) {
    var popupWasDelayedForLoad = $('h1').css('opacity') === 1;
    if(popupWasDelayedForLoad){
        $('h1').fadeOut(transitionTime / 2, function(){
            setHostname(domain_name);
            $('h1').fadeIn(transitionTime / 2);
        });
    }
    else {
        $('h1').css('opacity', 0);
        setHostname(domain_name);
        $('h1').animate({opacity: 1}, transitionTime);
    }
}

function setHostname(domain_name) {
    $('h1').html('<a href="#" id="domain" target="_blank">'
                 + htmlEncode(domain_name)
                 + '</a>');
}

function clearPopup() {
    $('div#flag-container').slideUp(transitionTime * 1.2, function(){
        $('#flag').remove();
    });
    $('#siteReport').remove();
    $('#reportPhish').remove();
    $('#ssl').remove();
    $('a').each(function() { $(this).removeAttr('target'); });

    var $noInfo = $('<p id="reason">' + cons.msgNoInfo + '</p>').hide();
    $('h1').after($noInfo);
    $noInfo.fadeIn(transitionTime);
}

function setLinkAddresses(link, info) {
    // Change HTML attributes first (dangerous! - use htmlEncode)

    // CAUTION: jQuery .attr() may not encode!
    // Use htmlEncode to be safe

    // Site report link
    var siteReport
        = htmlEncode(cons.report + link.protocol + "//" + link.hostname);
    $('#domain, #sitereport, #firstseen').attr("href", siteReport);

    // PFS link
    $('.pfslink').attr("href", cons.pfsUrl);

    // Heartbleed link
    $('.heartbleedlink').attr("href", cons.heartbleedUrl);

    // SSLv3 link
    $('.sslv3link').attr("href", cons.sslv3Url);

    // Set site rank link address
    $('#rank').attr(
        'href',
        htmlEncode(cons.topsites + info.topsites + "#" + info.rank)
    );

    // Set host link address
    $('#hoster').attr(
        'href',
        htmlEncode(cons.netblock + info.netblock)
    );

    // Set POODLE vulnerability link
    $('#uses_sslv3').attr(
        'href',
        htmlEncode(cons.blogArchive + cons.poodlePost)
    );
}

// Risk rating
function displayRiskRating(info) {
    var red = "0%";
    var green = "0%";
    if (info.risk > 0) {
        red = (parseInt(info.risk) - 1) + "5%";
        green = (parseInt(info.risk)) + "5%";
    }
    $('#riskrank').css('background-image',
        "-webkit-linear-gradient(left, #D00000 " + red + ", " +
        "#99FF33 " + green + ")");

    var riskRating = info.risk; //given a string

    var updates = [
        [$('span#risk'     ), riskRating]//,
        //[$('span#risktitle'), undefined ]
    ];
    for(var i = 0; i < updates.length; i++){
        updateTextContentWithFade(updates[i][0], updates[i][1]);
    }
}

function displayCountryFlag(country_name){
    var flagImage = htmlEncode(cons.flags + country_name + ".png");
    var $flagTag = $('img#flag');
    $flagTag.hide();
    $flagTag.attr("src", flagImage);
    $('img#flag').fadeIn(transitionTime);
}

function displaySiteInfo(info){
    var updates = [
        [$('span#country'), info.country    ],
        [$('#rank'       ), info.rank       ],
        [$('#firstseen'  ), info.firstseen  ],
        [$('#hoster'     ), info.hoster     ],
        [$('#uses_sslv3' ), info.uses_sslv3 ]
    ];
    for(var i = 0; i < updates.length; i++){
        updateTextContentWithFade(updates[i][0], updates[i][1]);
    }

    checkAndDisplaySSLInfo(info);
}

function checkAndDisplaySSLInfo(info){
    if (info.pfs == '' && info.heartbleed == '') return;

    var sslHTML =
            '<td><img id="pfswarn" /></td>'
        +   '<td class="title">'
        +       '<a href="#" class="pfslink" target="_blank">PFS</a>: '
        +   '</td>'
        +   '<td class="value">'
        +        '<a href="#" id="pfs" class="pfslink" target="_blank">-</a>'
        +   '</td>'
        +   '<td><img id="uses_sslv3" /></td>'
        +   '<td class="title">'
        +       '<a href="#" class="sslv3link" target="_blank">SSLv3</a>: '
        +   '</td>'
        +   '<td class="value">'
        +        '<span id="sslv3_text">Placeholder</span>'
        +   '</td>';

    var heartbleedHTML =
            '<td><div class="heartbleed-info">'
        +   '<img id="heartbleedwarn" />'
        +   '</div></td>'
        +   '<td class="title"><div class="heartbleed-info">'
        +       '<a href="#" id="heartbleeddef" '
        +          'class="heartbleedlink" target="_blank">Heartbleed</a>: '
        +   '</div></td>'
        +   '<td class="value"><div class="heartbleed-info">'
        +       '<a href="#" id="heartbleed" '
        +          'class="heartbleedlink" target="_blank">'
        +            '<img id="heartbleedicon" />'
        +       '</a>'
        +   '</div></td>';

    // Setup SSL row

    var $sslRow   = $('tr#ssl')
    $sslRow.hide();

    $sslRow.html(sslHTML);
    $('tr#ssl > td.title').hide();
    $('tr#ssl > td.value').hide();
    $('tr#ssl div img').hide();

    $sslRow.height($('#row3').innerHeight());
    var target_width = checkAndDisplayPFS(info.pfs);
    checkAndDisplaySSLv3(info.uses_sslv3);

    $sslRow.slideDown(transitionTime / 2, function(){
        $('tr#ssl > td.title').fadeIn(transitionTime / 4);
        $('tr#ssl > td.value').fadeIn(transitionTime / 2);
        $('tr#ssl div img'   ).fadeIn(transitionTime);
        if(target_width) $('img#pfswarn').show().animate({width: target_width}, transitionTime / 3);
    });

    // Setup second SSL row (currently just contains heartbleed)

    var $sslHbRow = $('tr#ssl-hb')
    $sslHbRow.hide();

    $sslHbRow.html(heartbleedHTML);
    $('tr#ssl-hb > td.title').hide();
    $('tr#ssl-hb > td.value').hide();
    $('tr#ssl-hb div img').hide();

    checkAndDisplayHeartbleed(info);

    $sslRow.slideDown(transitionTime / 2, function(){
        $('tr#ssl-hb > td.title').fadeIn(transitionTime / 4);
        $('tr#ssl-hb > td.value').fadeIn(transitionTime / 2);
        $('tr#ssl-hb div img'   ).fadeIn(transitionTime);
    });
}

function checkAndDisplayPFS(pfs_info) {
    var target_width = 0;
    if (pfs_info === '1') {
        $('#pfs').addClass('yes');
        $('#pfswarn').remove();
        pfs_info = '&#x2714;';
    }
    else if (pfs_info === '0') {
        $('a#pfs').addClass('no');
        $pfsWarningIcon = $('img#pfswarn');
        $pfsWarningIcon.attr('src', cons.warning);

        $pfsWarningIcon.show();
        target_width  = $pfsWarningIcon.width();
        $pfsWarningIcon.width('0px');
        $pfsWarningIcon.hide();

        //$pfsWarningIcon.animate({width: target_width}, transitionTime / 3);

        pfs_info = '&#x2718;';
    } else {
        pfs_info = '-';
    }
    $('#pfs').html(pfs_info);
    return target_width
}

function checkAndDisplaySSLv3(sslv3_info) {

    if(sslv3_info == '0') {
        sslv3_text = 'Not supported';
    }
    else if (sslv3_info == '1') {
        sslv3_text = 'Supported';
    }

    $('#sslv3_text').html(sslv3_text);
}


function checkAndDisplayHeartbleed(info) {
    if (info.heartbleed == 'safe') {
        $('#heartbleed').addClass('yes');
        // Don't show anything when not affected
        $('tr#ssl-hb').hide();
    }
    else if (info.heartbleed == 'unsafe') {
        $('#heartbleed').addClass('no');
        $('#heartbleedwarn').attr('title', info.heartbleed_message);
        $('#heartbleedicon').attr('title', info.heartbleed_message);
        $('#heartbleeddef').attr('title', info.heartbleed_message);
        $('#heartbleedwarn').attr('src', cons.warning);
        $('#heartbleedicon').attr('src', cons.heartbleed);
        $('tr#ssl-hb').show();
    }
}

// ---- general utility --------------

// if new text is not passed as a parameter/is undefined,
// then this simply fadesthe elemnt in, then out (keeping same text)
function updateTextContentWithFade($element, newText){
    $element.hide();
    $element.text(newText);
    $element.fadeIn(transitionTime);
    /*
    $element.fadeOut(transitionTime / 2 , function(){
        $element.text(newText);
        $element.fadeIn(transitionTime / 2 );
    });
    */
}

// Format site rank
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Self explanatory
function htmlEncode(value) {
    return $('<div/>').text(value).html();
}
