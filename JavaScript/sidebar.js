'use strict';
window.addEventListener('DOMContentLoaded', async function () {
    //console.log('DOMContentLoaded');
    //let tabcontainer = render_tabs();
    browser.runtime.sendMessage({
        initialized: "pls send all tabs"
    }, function (response) {});

});
/*
browser.contextMenus.onClicked.addListener(function (info, tab) {
    console.log('context menu init');
    //aEvent.stopImmediatePropagation();
    //aEvent.stopPropagation();
    //aEvent.preventDefault();
    //return false;

},true);
*/



document.oncontextmenu = function(){
    return false;
};

browser.runtime.onMessage.addListener(function (message, sender) {

    //console.log(message);
    if (message.tabs) { // We've received tabs
        render_tabs(message.tabs, sender)
    }

});

function render_tabs(message, sender) {
    let sat = 61;
    let lum = 73;
    //console.log("rendering");
    //return;
    var tabbar = document.getElementById('colorfulTabsContainer');
    while (tabbar.hasChildNodes()) {
        tabbar.removeChild(tabbar.lastChild)
    }

    let newtabbtn = document.createElement('span');
    newtabbtn.id = 'colorfultabs-newtab';
    newtabbtn.className = 'tab';
    newtabbtn.addEventListener('click', function () {
        //console.log('someday this will open a new tab');
        browser.runtime.sendMessage({
            newtab: 'newtab'
        });
    });
    tabbar.appendChild(newtabbtn);

    let tabstrippinned = document.createElement('span');
    tabstrippinned.id = 'tabstrippinned';
    tabstrippinned.className = 'tabstrippinned';
    tabbar.appendChild(tabstrippinned);

    let tabstrip = document.createElement('span');
    tabstrip.id = 'tabstrip';
    tabstrip.className = 'tabstrip';
    tabbar.appendChild(tabstrip);



    for (var i = 0; i < message.length; ++i) {
        let tab = document.createElement('span');
        tab.className = 'tab';
        tab.id = message[i].id;
        //console.log(message[i].url)
        let host = new URL(message[i].url);
        host = host.hostname.toString();

        //console.log(host);
        var hue = genColor(host);
        tab.setAttribute("data-ct-color", `hsl(${hue},${sat}%,${lum}%);`);
        //var gradientstyle = `linear-gradient(hsla(0,0%,100%,.7),hsla(${hue},${sat}%,${lum}%,.5),hsla(${hue},${sat}%,${lum}%,1)),linear-gradient(hsla(${hue},${sat}%,${lum}%,1),hsla(${hue},${sat}%,${lum}%,1))`;
        var gradientstyle = `linear-gradient(to right, hsla(0,0%,100%,.7),hsla(${hue},${sat}%,${lum}%,.5),hsla(${hue},${sat}%,${lum}%,1)),linear-gradient(to left, hsla(${hue},${sat}%,${lum}%,1),hsla(${hue},${sat}%,${lum}%,1))`;
        //var gradientstyle = `linear-gradient( to left, hsla(0,0%,100%,.7),hsla(${hue},${sat}%,${lum}%,1),hsla(${hue},${sat}%,${lum}%,1)),linear-gradient(white, white)`;
        tab.style = "background-image:" + gradientstyle;

        tab.setAttribute('active', message[i].active);
        let attribs = Object.keys(message[i]);
        tab.title = message[i].title;
        for (var a = 0; a < attribs.length; a++) {
            if (message[i].hasOwnProperty(attribs[a])) {
                tab.setAttribute("data-ct-" + attribs[a], message[i][attribs[a]]);
            }
        }
        if (message[i].active == true) {
            tabstrip.setAttribute('dataactive', message[i].id);
            document.body.style.borderRightColor = `hsla(${hue},${sat}%,${lum}%,1)`;
        }

        if (message[i].pinned == true) {
            tabstrippinned.appendChild(tab);
        } else {
            tabstrip.appendChild(tab);
        }
        tab.addEventListener('click', function (e) {
            let element = e.target;
            while (element.className != 'tab') {
                element = element.parentElement;
            }

            //console.log(parseInt(element.getAttribute('id')));
            browser.runtime.sendMessage({
                select: {tabId :parseInt(element.getAttribute('id'))}
            });
        });
        let tabicon = document.createElement('span');
        tabicon.className = 'icon';
        try {
            tabicon.style.setProperty('background', 'url(' + message[i].favIconUrl + ') no-repeat center');
        } catch (e) {}
        tabicon.setAttribute('background-size', 'contain');
        tab.appendChild(tabicon);

        let tabtitle = document.createElement('span');
        tabtitle.className = 'title';
        let titletext = document.createTextNode(message[i].title);
        tabtitle.appendChild(titletext);
        tab.appendChild(tabtitle);

        let tabclose = document.createElement('span');
        tabclose.className = 'closebtn';
        tabclose.setAttribute('data-close-id', message[i].id);
        tab.appendChild(tabclose);
        tabclose.addEventListener('click', function (event) {
            event.stopPropagation();
            event.preventDefault();
            let tabclose = this.getAttribute('data-close-id');
            browser.runtime.sendMessage({
                close: { tabId : parseInt(tabclose) }
            }, function (response) {});
        })
    }


    /*let body = document.getElementById('colorfulTabsContainer').contentDocument.body;
    body.addEventListener('contextmenu', event => event.preventDefault());

    let scrollleftbtn = document.createElement('span');
    scrollleftbtn.id = 'colorfultabs-go-left';
    scrollleftbtn.addEventListener('click', function () {
        tabstrip.scrollBy({
            "behavior": "smooth",
            "left": -500,
            "top": 0
        });
    });
    tabbar.insertBefore(scrollleftbtn, tabbar.firstChild);

    let scrollrightbtn = document.createElement('span');
    scrollrightbtn.id = 'colorfultabs-go-right';
    scrollrightbtn.addEventListener('click', function () {
        tabstrip.scrollBy({
            "behavior": "smooth",
            "left": 500,
            "top": 0
        });
    });
    tabbar.appendChild(scrollrightbtn);

    let newtabbtn = document.createElement('span');
    newtabbtn.id = 'colorfultabs-newtab';
    newtabbtn.addEventListener('click', function () {
        //console.log('someday this will open a new tab');
        browser.runtime.sendMessage({
            newtab: 'newtab'
        });
    });
    tabbar.appendChild(newtabbtn);

    let ct_window = colorfulTabsContainer.contentWindow;
    let ct_doc = colorfulTabsContainer.contentDocument;

    let posleft = parseInt(ct_window.getComputedStyle(ct_doc.getElementById('tabstrippinned'), null).getPropertyValue('width'));
    posleft = posleft + 32;
    tabstrip.style.left = posleft + 'px';
    tabstrip.style.maxWidth = 'calc(100% - ' + posleft + 'px - 64px)';

    let widthunpinned = ct_window.getComputedStyle(ct_doc.getElementById('tabstrip'), null).getPropertyValue('width');
    widthunpinned = parseInt(widthunpinned);
    widthunpinned = widthunpinned + posleft;
    newtabbtn.style.left = (widthunpinned + 1) + 'px';

    tabstrippinned.addEventListener("wheel", function (event, delta) {
        event.stopPropagation();
        event.preventDefault();

    }, true);




    let selected = tabstrip.querySelector('[active="true"]');
    let selectedClr = selected.getAttribute("data-ct-color");
    selectedClr = selectedClr.replace(";", "");
    result.style.borderBottom = "5px solid " + selectedClr;
    try {
        selected.scrollIntoView({
            behavior: "instant",
            inline: "center",
            block: "center"
        });
    } catch (e) {}
    */

}


async function update_tabs() {
    //console.log('initialized');
    return document.getElementById('colorfulTabsContainer');
}


function genColor(data) {
    var hash = sha256(data.toString());
    var iClr, clrConst = 5381; // var clrString = ;
    for (iClr = 0; iClr < hash.length; iClr++) {
        clrConst = ((clrConst << 5) + clrConst) + hash.charCodeAt(iClr);
    }
    let rating = 10;
//    return Math.abs(clrConst) % 360;
    return(125 * (1 - 0.1 * rating));
}

// Generate a unique hash for a wider color spectrum
function sha256(s) {

    var chrsz = 8;
    var hexcase = 0;

    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    function S(X, n) {
        return (X >>> n) | (X << (32 - n));
    }

    function R(X, n) {
        return (X >>> n);
    }

    function Ch(x, y, z) {
        return ((x & y) ^ ((~x) & z));
    }

    function Maj(x, y, z) {
        return ((x & y) ^ (x & z) ^ (y & z));
    }

    function Sigma0256(x) {
        return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
    }

    function Sigma1256(x) {
        return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
    }

    function Gamma0256(x) {
        return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
    }

    function Gamma1256(x) {
        return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
    }

    function core_sha256(m, l) {
        var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
        var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
        var W = new Array(64);
        var a, b, c, d, e, f, g, h, i, j;
        var T1, T2;
        m[l >> 5] |= 0x80 << (24 - l % 32);
        m[((l + 64 >> 9) << 4) + 15] = l;
        for (var i = 0; i < m.length; i += 16) {
            a = HASH[0];
            b = HASH[1];
            c = HASH[2];
            d = HASH[3];
            e = HASH[4];
            f = HASH[5];
            g = HASH[6];
            h = HASH[7];
            for (var j = 0; j < 64; j++) {
                if (j < 16) W[j] = m[j + i];
                else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
                T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
                T2 = safe_add(Sigma0256(a), Maj(a, b, c));
                h = g;
                g = f;
                f = e;
                e = safe_add(d, T1);
                d = c;
                c = b;
                b = a;
                a = safe_add(T1, T2);
            }
            HASH[0] = safe_add(a, HASH[0]);
            HASH[1] = safe_add(b, HASH[1]);
            HASH[2] = safe_add(c, HASH[2]);
            HASH[3] = safe_add(d, HASH[3]);
            HASH[4] = safe_add(e, HASH[4]);
            HASH[5] = safe_add(f, HASH[5]);
            HASH[6] = safe_add(g, HASH[6]);
            HASH[7] = safe_add(h, HASH[7]);
        }
        return HASH;
    }

    function str2binb(str) {
        var bin = Array();
        var mask = (1 << chrsz) - 1;
        for (var i = 0; i < str.length * chrsz; i += chrsz) {
            bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32);
        }
        return bin;
    }

    function Utf8Encode(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    }

    function binb2hex(binarray) {
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
                hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
        }
        return str;
    }
    s = Utf8Encode(s);
    return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
}
