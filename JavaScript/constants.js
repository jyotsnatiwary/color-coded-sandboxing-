/*
 * Netcraft Extension
 * constants JavaScript
 */

// Extension constants
cons = {
    fields:       ['topsites', 'country', 'netblock', 'hoster', 
                   'firstseen', 'rank', 'risk', 'uses_sslv3', 'pfs', 'heartbleed', 'heartbleed_message'],
    
    // URLs and paths
    mirror:        'https://mirror2.extension.netcraft.com/',
    toolbar:       'https://toolbar.netcraft.com/',
    report:        'https://toolbar.netcraft.com/site_report?url=',
    topsites:      'https://toolbar.netcraft.com/stats/topsites?s=',
    netblock:      'https://toolbar.netcraft.com/netblock?q=',
    reportPhish:   'https://toolbar.netcraft.com/report_url?url=',
    reportMistake: 'https://toolbar.netcraft.com/report_mistake?url=',
    pfsUrl:        'https://toolbar.netcraft.com/help/faq/index.html#pfs',
    heartbleedUrl: 'https://toolbar.netcraft.com/help/faq/index.html#heartbleed',
    sslv3Url:      'https://toolbar.netcraft.com/help/faq/index.html#sslv3',
    blogArchive:   'https://news.netcraft.com/archives/',
    poodlePost:    '2014/10/15/googles-poodle-affects-oodles.html',
    check:         'check_url/v2/',
    force:         '/dodns',
    embed:         '/embedded',
    info:          '/info',
    block:         'blocked.html?ref=',
    flags:         'Images/flags/',
    warning:       'Images/warning.png',
    danger:        'Images/danger.png',
    heartbleed:    'Images/heartbleed.png',

    // browserAction icon paths
    iconNormal: {
        19: 'Images/action-normal.png',
        38: 'Images/action-normal-2x.png'
    },
    iconDanger: {
        19: 'Images/action-danger.png',
        38: 'Images/action-danger-2x.png'
    },
    iconWarning: {
        19: 'Images/action-warning.png',
        38: 'Images/action-warning-2x.png'
    },

    // Extension internal message types
    reqPopUp:     'popup',
    reqBlock:     'block',
    reqCheck:     'check',
    reqForce:     'force',
    reqDetails:   'details',
    reqDanger:    'danger',
    reqPrintTimingData: 'time', //debug
    
    // Status codes
    errPending:   "PENDING",
    errNoInfo:    "NOINFO",
    errNoDetails: "NODETAILS",
    errPhish:     "PHISH",
    errXSS:       "XSS",
    errSuspicious:"SUSPICIOUS",
    errServer:    "ERROR",
    errTimeout:   "TIMEOUT",
    noError:      "OK",
    
    // Valid protocols (it is a regex match so ^ matches start of string)
    protocols:    ['^http', '^https', '^ftp'], 

    // Human readable messages
    msgPhish:     "Suspected Phishing",
    msgXSS:       "Suspected XSS Attack",
    msgSuspicious:"Suspicious URL Detected",
    msgNoInfo:    "Site information not available",
    msgNoServer:  "Unable to contact Netcraft servers",
    msgNewSite:   "New Site",
    msgNa:        "NA",

    // Timeout function value to clear cache etc.
    timeout:      300000,
     
    // Google Analytics account
    account:      'UA-2150242-8',

    gaCategory: 'Popup load times'
}
