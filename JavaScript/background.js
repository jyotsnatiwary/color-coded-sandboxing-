/*
 * Netcraft Extension
 * background JavaScript
 *
 * This is the main extension JavaScript file. The only actions this file
 * does are:
 * 1) Set up a timeout function to clear the cache every 5 minutes
 * 2) Listen to requests to start the query to check_url
 * 3) Listen to responses to save the IP for additional details if needed
 * 4) Listen to messages from other JavaScripts of this extension
 */

// Dependencies
// * constants.js
// * TrackTiming.js

//let tabClr = 'hsl(' + Math.abs(125*(1 - 0.1*rating)) % 360 + ',' + sat + '%,' + lum + '%)';

var ColorfulTabs = {
    init(rating) {
        ColorfulTabs.initTheme();

        browser.tabs.onActivated.addListener(async (activeInfo) => {
            await browser.tabs.get(activeInfo.tabId, async (tab) => {
                let host = new URL(tab.url);
                host = host.hostname.toString();
                let sat = await getOption("saturation");
                let lum = await getOption("lightness");
                let tabClr = 'hsl(' + Math.abs(125*(1 - 0.1*rating)) % 360 + ',' + sat + '%,' + lum + '%)';
                ColorfulTabs.clrtheme.colors.toolbar = tabClr;
                await ColorfulTabs.updateTheme(tab.windowId, ColorfulTabs.clrtheme);
            });
        });

        browser.runtime.onMessage.addListener(
            function (request, sender, sendResponse) {


                if (request.initialized) {
                    ColorfulTabs.sendTabs(request, sender, sendResponse);
                }

                if (request.select) {
                    //console.log(JSON.stringify(request.select))
                    //console.log(request.select.tabId)
                    // let select = {tabId: request.select};
                    //console.log(request)
                    ColorfulTabs.onActivated(request.select);
                    //ColorfulTabs.sendTabs(request, sender, sendResponse);
                }
                if (request.close) {
                    //console.log(request)
                    //ColorfulTabs.onRemoved(request.close, "");
                    ColorfulTabs.onRemoved(request.close.tabId, request.close);
                    //ColorfulTabs.sendTabs(request, sender, sendResponse);
                }
                /*
                 if (request.getoptions) {
                    browser.runtime.sendMessage({
                        settings: "these will be the options"
                    });
                }
                */
                if (request.newtab) {
                    //console.log(request)
                    browser.tabs.create({
                        active: true
                    });
                }

            }
        );
        browser.tabs.onCreated.addListener(ColorfulTabs.setBadge);
        browser.tabs.onAttached.addListener(ColorfulTabs.setBadge);
        browser.tabs.onDetached.addListener(ColorfulTabs.setBadge);
        browser.tabs.onRemoved.addListener(ColorfulTabs.setBadge);


        browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
            if (changeInfo.status != "complete") {
                return;
            }
            await browser.tabs.get(tabId, async (tab) => {
                let host = new URL(tab.url);
                host = host.hostname.toString();
                let sat = await getOption("saturation");
                let lum = await getOption("lightness");
                let tabClr = 'hsl(' + Math.abs(125*(1 - 0.1*rating)) % 360 + ',' + sat + '%,' + lum + '%)';
                ColorfulTabs.clrtheme.colors.toolbar = tabClr;
                await ColorfulTabs.updateTheme(tab.windowId, ColorfulTabs.clrtheme);
            });
        });

        browser.tabs.onActivated.addListener(ColorfulTabs.onActivated);
        browser.tabs.onAttached.addListener(ColorfulTabs.onAttached);
        browser.tabs.onCreated.addListener(ColorfulTabs.onCreated);
        browser.tabs.onDetached.addListener(ColorfulTabs.onDetached);
        browser.tabs.onHighlighted.addListener(ColorfulTabs.onHighlighted);
        browser.tabs.onMoved.addListener(ColorfulTabs.onMoved);
        browser.tabs.onRemoved.addListener(ColorfulTabs.onRemoved);
        browser.tabs.onReplaced.addListener(ColorfulTabs.onReplaced);
        browser.tabs.onUpdated.addListener(ColorfulTabs.onUpdated);

        //browser.tabs.onSelectionChanged.addListener();
        //browser.tabs.onUpdated.addListener(ColorfulTabs.sendTabs);


    },
    onActivated(activeInfo) {
        //console.log(activeInfo);
        //console.log("activeInfo~~:" + JSON.stringify(activeInfo))
        browser.tabs.update(parseInt(activeInfo.tabId), {
            active: true
            //selected: true
        });

        browser.tabs.query({
            currentWindow: true
        }, function (tabs) {

            browser.runtime.sendMessage({
                tabs: tabs
            });
        });
    },
    onAttached(tabID, attachInfo) {
        //console.log("tabID, attachInfo~~:" + tabID + "~~" + JSON.stringify(attachInfo))
        browser.tabs.query({
            currentWindow: true
        }, function (tabs) {
            browser.runtime.sendMessage({
                tabs: tabs
            });
        });
    },
    onCreated(tab) {
        //console.log("tab~~:" + JSON.stringify(tab))
        browser.tabs.query({
            currentWindow: true
        }, function (tabs) {
            browser.runtime.sendMessage({
                tabs: tabs
            });
        });
    },
    onDetached(tabId, detachInfo) {
        //console.log("tabID, detachInfo~~:" + tabID + "~~" + JSON.stringify(detachInfo));
        browser.tabs.query({
            currentWindow: true
        }, function (tabs) {
            browser.runtime.sendMessage({
                tabs: tabs
            });
        });
    },
    onHighlighted(highlightInfo) {
        //console.log("highlightInfo~~:" + JSON.stringify(highlightInfo));
        browser.tabs.query({
            currentWindow: true
        }, function (tabs) {
            browser.runtime.sendMessage({
                tabs: tabs
            });
        });
    },
    onMoved(tabId, moveInfo) {
        //console.log("tabID, moveInfo~~:" + tabID + "~~" + JSON.stringify(moveInfo))
        browser.tabs.query({
            currentWindow: true
        }, function (tabs) {
            browser.runtime.sendMessage({
                tabs: tabs
            });
        });
    },
    onRemoved(tabId, removeInfo) {
        //console.log("tabId, removeInfo~~:" + tabId + "~~" + JSON.stringify(removeInfo))
        //browser.tabs.query({currentWindow: true}, function (tabs) {browser.runtime.sendMessage({tabs: tabs});});
        browser.tabs.remove(tabId, function () {
            browser.tabs.query({
                currentWindow: true
            }, function (tabs) {
                tabs = tabs.filter(tab => tab.id != tabId);
                browser.runtime.sendMessage({
                    tabs: tabs
                });
            })
        });
    },
    onReplaced(addedTabId, removedTabId) {
        //console.log("addedTabId, removeInfo~~:" + addedTabId + "~~" + JSON.stringify(removedTabId))
        browser.tabs.query({
            currentWindow: true
        }, function (tabs) {
            browser.runtime.sendMessage({
                tabs: tabs
            });
        });
    },
    onUpdated(tabId, changeInfo, tabInfo) {
        //console.log("tabId, changeInfo, tabInfo~~:" + tabId + "~~" + JSON.stringify(changeInfo) + "~~" + JSON.stringify(tabInfo))
        browser.tabs.query({
            currentWindow: true
        }, function (tabs) {
            browser.runtime.sendMessage({
                tabs: tabs
            });
        });
    },
    sendTabs(info) {
        //return;
        /*
                if (request.select) {
                    //console.log('select' + request.select);
                    browser.tabs.update(parseInt(request.select), {
                        active: true
                    });
                }
                if (request.close) {
                    browser.tabs.remove(parseInt(request.close), function () { });
                }
                */
        browser.tabs.query({
            currentWindow: true
        }, function (tabs) {
            browser.runtime.sendMessage({
                tabs: tabs
            });
            /*tabs = tabs.filter(tab => tab.id != request.close);
            for (var i = 0; i < tabs.length; ++i) {
                browser.runtime.sendMessage({
                    tabs: tabs
                });
            }
            */
        });
    },
    setBadge() {
        browser.windows.getCurrent({
            populate: true
        }, function (window) {
            browser.browserAction.setBadgeText({
                text: window.tabs.length.toString()
            });
        });
    },
    async initTheme() {

        let headerColor = await getOption("accentcolor");
        headerColor = await ColorfulTabs.rgbclr(headerColor);
        let headerImage = ColorfulTabs.generateImage(headerColor);

        ColorfulTabs.clrtheme.images.headerURL = headerImage;

        let accentcolor = await ColorfulTabs.rgbclr(await getOption("accentcolor"));
        ColorfulTabs.clrtheme.colors.accentcolor = "rgb(" + accentcolor + ")";

        let textcolor = await ColorfulTabs.rgbclr(await getOption("textcolor"));
        ColorfulTabs.clrtheme.colors.textcolor = "rgb(" + textcolor + ")";

        let toolbar_text = await ColorfulTabs.rgbclr(await getOption("toolbar_text"));
        ColorfulTabs.clrtheme.colors.toolbar_text = "rgb(" + toolbar_text + ")";

        let toolbar_field = await ColorfulTabs.rgbclr(await getOption("toolbar_field"));
        ColorfulTabs.clrtheme.colors.toolbar_field = "rgb(" + toolbar_field + ")";

        let toolbar_field_text = await ColorfulTabs.rgbclr(await getOption("toolbar_field_text"));

        ColorfulTabs.clrtheme.colors.toolbar_field_text = "rgb(" + toolbar_field_text + ")";

        //updatedTheme.images.headerURL = headerImage;
    },

    generateImage(color) {
        var ctCanvas = document.createElement('canvas');
        ctCanvas.id = 'ctCanvas';
        ctCanvas.width = '1';
        ctCanvas.height = '1';
        var ctx = ctCanvas.getContext("2d");
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        var myImage = ctCanvas.toDataURL("image/png");
        return myImage;
    },

    clrtheme: {
        "images": {
            "headerURL": ""
        },
        "colors": {
            "accentcolor": "#fff",
            "textcolor": "#000",
            "toolbar": "rgba(255,0,0, 1)",
            "toolbar_text": "#000",
            "toolbar_field": "#000",
            "toolbar_field_text": "#000",

        }
    },

    clrHash(clrString) {
        var hash = ColorfulTabs.sha256(clrString);
        var iClr, clrConst = 5381;
        for (iClr = 0; iClr < hash.length; iClr++) {
            clrConst = ((clrConst << 5) + clrConst) + hash.charCodeAt(iClr);
        }
        return clrConst;
    },

    async updateTheme(windowId, updatedTheme) {
        //let headerImage = generateImage("white");
        //updatedTheme.images.headerURL = headerImage;
        await browser.theme.update(windowId, updatedTheme);
    },

    get_hsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        h = Math.floor(h * 360)
        while (h > 360) {
            h = h - 360;
        }
        s = Math.floor(s * 100);
        l = Math.floor(l * 100);
        return [h, s, l];
    },

    async rgbclr(clr) {
        clr = clr.toString();
        clr = clr.replace(/^\s+|\s+$/, ''); //trim
        if (clr.indexOf('rgb') >= 0 && clr.indexOf('rgba') < 0) {
            clr = clr.replace('rgb', '');
            clr = clr.replace('(', '')
            clr = clr.replace(')', '')
        } else {
            if (clr.indexOf('hsl') >= 0 && clr.indexOf('hsla') < 0) {
                clr = clr.replace('hsl', '');
                clr = clr.replace('%', '')
                clr = clr.replace('%', '')
                clr = clr.replace('(', '')
                clr = clr.replace(')', '')
                clr = clr.split(',');
                clr = ColorfulTabs.hsl2rgb(clr[0], clr[1], clr[2]);
            } else {
                if (clr.indexOf('#') >= 0) {
                    clr = clr.replace('#', '');
                    var r = parseInt(clr.substring(0, 2), 16);
                    var g = parseInt(clr.substring(2, 4), 16)
                    var b = parseInt(clr.substring(4, 6), 16);
                    if (clr.length == 3) {
                        r = clr.substring(0, 1) + '' + clr.substring(0, 1)
                        g = clr.substring(1, 2) + '' + clr.substring(1, 2)
                        b = clr.substring(2, 3) + '' + clr.substring(2, 3)
                        r = parseInt(r, 16);
                        g = parseInt(g, 16)
                        b = parseInt(b, 16);
                        r
                    }

                    clr = r + "," + g + "," + b;
                } else {
                    try {
                        var clrKeys = {
                            aliceblue: "rgb(240,248,255)",
                            antiquewhite: "rgb(250,235,215)",
                            aqua: "rgb(0,255,255)",
                            aquamarine: "rgb(127,255,212)",
                            azure: "rgb(240,255,255)",
                            beige: "rgb(245,245,220)",
                            bisque: "rgb(255,228,196)",
                            black: "rgb(0,0,0)",
                            blanchedalmond: "rgb(255,235,205)",
                            blue: "rgb(0,0,255)",
                            blueviolet: "rgb(138,43,226)",
                            brown: "rgb(165,42,42)",
                            burlywood: "rgb(222,184,135)",
                            cadetblue: "rgb(95,158,160)",
                            chartreuse: "rgb(127,255,0)",
                            chocolate: "rgb(210,105,30)",
                            coral: "rgb(255,127,80)",
                            cornflowerblue: "rgb(100,149,237)",
                            cornsilk: "rgb(255,248,220)",
                            crimson: "rgb(220,20,60)",
                            cyan: "rgb(0,255,255)",
                            darkblue: "rgb(0,0,139)",
                            darkcyan: "rgb(0,139,139)",
                            darkgoldenrod: "rgb(184,134,11)",
                            darkgray: "rgb(169,169,169)",
                            darkgreen: "rgb(0,100,0)",
                            darkgrey: "rgb(169,169,169)",
                            darkkhaki: "rgb(189,183,107)",
                            darkmagenta: "rgb(139,0,139)",
                            darkolivegreen: "rgb(85,107,47)",
                            darkorange: "rgb(255,140,0)",
                            darkorchid: "rgb(153,50,204)",
                            darkred: "rgb(139,0,0)",
                            darksalmon: "rgb(233,150,122)",
                            darkseagreen: "rgb(143,188,143)",
                            darkslateblue: "rgb(72,61,139)",
                            darkslategray: "rgb(47,79,79)",
                            darkslategrey: "rgb(47,79,79)",
                            darkturquoise: "rgb(0,206,209)",
                            darkviolet: "rgb(148,0,211)",
                            deeppink: "rgb(255,20,147)",
                            deepskyblue: "rgb(0,191,255)",
                            dimgray: "rgb(105,105,105)",
                            dimgrey: "rgb(105,105,105)",
                            dodgerblue: "rgb(30,144,255)",
                            firebrick: "rgb(178,34,34)",
                            floralwhite: "rgb(255,250,240)",
                            forestgreen: "rgb(34,139,34)",
                            fuchsia: "rgb(255,0,255)",
                            gainsboro: "rgb(220,220,220)",
                            ghostwhite: "rgb(248,248,255)",
                            gold: "rgb(255,215,0)",
                            goldenrod: "rgb(218,165,32)",
                            gray: "rgb(128,128,128)",
                            green: "rgb(0,128,0)",
                            greenyellow: "rgb(173,255,47)",
                            grey: "rgb(128,128,128)",
                            honeydew: "rgb(240,255,240)",
                            hotpink: "rgb(255,105,180)",
                            indianred: "rgb(205,92,92)",
                            indigo: "rgb(75,0,130)",
                            ivory: "rgb(255,255,240)",
                            khaki: "rgb(240,230,140)",
                            lavender: "rgb(230,230,250)",
                            lavenderblush: "rgb(255,240,245)",
                            lawngreen: "rgb(124,252,0)",
                            lemonchiffon: "rgb(255,250,205)",
                            lightblue: "rgb(173,216,230)",
                            lightcoral: "rgb(240,128,128)",
                            lightcyan: "rgb(224,255,255)",
                            lightgoldenrodyellow: "rgb(250,250,210)",
                            lightgray: "rgb(211,211,211)",
                            lightgreen: "rgb(144,238,144)",
                            lightgrey: "rgb(211,211,211)",
                            lightpink: "rgb(255,182,193)",
                            lightsalmon: "rgb(255,160,122)",
                            lightseagreen: "rgb(32,178,170)",
                            lightskyblue: "rgb(135,206,250)",
                            lightslategray: "rgb(119,136,153)",
                            lightslategrey: "rgb(119,136,153)",
                            lightsteelblue: "rgb(176,196,222)",
                            lightyellow: "rgb(255,255,224)",
                            lime: "rgb(0,255,0)",
                            limegreen: "rgb(50,205,50)",
                            linen: "rgb(250,240,230)",
                            magenta: "rgb(255,0,255)",
                            maroon: "rgb(128,0,0)",
                            mediumaquamarine: "rgb(102,205,170)",
                            mediumblue: "rgb(0,0,205)",
                            mediumorchid: "rgb(186,85,211)",
                            mediumpurple: "rgb(147,112,219)",
                            mediumseagreen: "rgb(60,179,113)",
                            mediumslateblue: "rgb(123,104,238)",
                            mediumspringgreen: "rgb(0,250,154)",
                            mediumturquoise: "rgb(72,209,204)",
                            mediumvioletred: "rgb(199,21,133)",
                            midnightblue: "rgb(25,25,112)",
                            mintcream: "rgb(245,255,250)",
                            mistyrose: "rgb(255,228,225)",
                            moccasin: "rgb(255,228,181)",
                            navajowhite: "rgb(255,222,173)",
                            navy: "rgb(0,0,128)",
                            oldlace: "rgb(253,245,230)",
                            olive: "rgb(128,128,0)",
                            olivedrab: "rgb(107,142,35)",
                            orange: "rgb(255,165,0)",
                            orangered: "rgb(255,69,0)",
                            orchid: "rgb(218,112,214)",
                            palegoldenrod: "rgb(238,232,170)",
                            palegreen: "rgb(152,251,152)",
                            paleturquoise: "rgb(175,238,238)",
                            palevioletred: "rgb(219,112,147)",
                            papayawhip: "rgb(255,239,213)",
                            peachpuff: "rgb(255,218,185)",
                            peru: "rgb(205,133,63)",
                            pink: "rgb(255,192,203)",
                            plum: "rgb(221,160,221)",
                            powderblue: "rgb(176,224,230)",
                            purple: "rgb(128,0,128)",
                            red: "rgb(255,0,0)",
                            rosybrown: "rgb(188,143,143)",
                            royalblue: "rgb(65,105,225)",
                            saddlebrown: "rgb(139,69,19)",
                            salmon: "rgb(250,128,114)",
                            sandybrown: "rgb(244,164,96)",
                            seagreen: "rgb(46,139,87)",
                            seashell: "rgb(255,245,238)",
                            sienna: "rgb(160,82,45)",
                            silver: "rgb(192,192,192)",
                            skyblue: "rgb(135,206,235)",
                            slateblue: "rgb(106,90,205)",
                            slategray: "rgb(112,128,144)",
                            slategrey: "rgb(112,128,144)",
                            snow: "rgb(255,250,250)",
                            springgreen: "rgb(0,255,127)",
                            steelblue: "rgb(70,130,180)",
                            tan: "rgb(210,180,140)",
                            teal: "rgb(0,128,128)",
                            thistle: "rgb(216,191,216)",
                            tomato: "rgb(255,99,71)",
                            turquoise: "rgb(64,224,208)",
                            violet: "rgb(238,130,238)",
                            wheat: "rgb(245,222,179)",
                            white: "rgb(255,255,255)",
                            whitesmoke: "rgb(245,245,245)",
                            yellow: "rgb(255,255,0)",
                            yellowgreen: "rgb(154,205,50)"
                        }
                        clr = clrKeys[clr];
                        clr = clr.replace('rgb', '');
                        clr = clr.replace('(', '')
                        clr = clr.replace(')', '')
                    } catch (e) {
                        console.log("rgbclr Could not convert color to rgb because of the following error:\n" + e)
                    }
                }
            }
        }
        return clr;
    },

    //does... figure it out by the functionname
    hsl2rgb(h, s, l) {
        var m1, m2, hue;
        var r, g, b
        s /= 100;
        l /= 100;
        if (s == 0)
            r = g = b = (l * 255);
        else {
            if (l <= 0.5)
                m2 = l * (s + 1);
            else
                m2 = l + s - l * s;
            m1 = l * 2 - m2;
            hue = h / 360;
            r = ColorfulTabs.HueToRgb(m1, m2, hue + 1 / 3);
            g = ColorfulTabs.HueToRgb(m1, m2, hue);
            b = ColorfulTabs.HueToRgb(m1, m2, hue - 1 / 3);
        }
        return Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b); //255,255,255
    },

    //does... figure it out by the functionname
    HueToRgb(m1, m2, hue) {
        var v;
        if (hue < 0)
            hue += 1;
        else if (hue > 1)
            hue -= 1;
        if (6 * hue < 1)
            v = m1 + (m2 - m1) * hue * 6;
        else if (2 * hue < 1)
            v = m2;
        else if (3 * hue < 2)
            v = m1 + (m2 - m1) * (2 / 3 - hue) * 6;
        else
            v = m1;
        return 255 * v;
    },

    // Generate a unique hash for a wider color spectrum
    sha256(s) {

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
}


// Holds all site info
var cache = {};
// Holds all malicious URL info
var phish = new Array();

var debug = true;

// Errors from server
var errors = 0;

// List of valid protocol regexes
var validProtocolRegexes = buildRegex(cons.protocols);
var noDataStatuses = [
        cons.errServer,    cons.errPending, cons.errTimeout,
        cons.errNoDetails, cons.errNoInfo
    ];

// Log in debugging mode
function printDebugMessage(msg) {
    if (debug) console.log("DEBUG** " + msg);
}

// Given regex patterns and a str check if str matches
function stringMatchesRegex(patterns, str) {
    if (!patterns || patterns.length == 0) return false;
    for (var pat = 0; pat < patterns.length; pat++) {
        if (patterns[pat].exec(str)) return true;
    }
    return false;
}

// Builds array of regexes received from check_url
function buildRegex(strar) {
    if (!strar || strar.length == 0) return null;
    var regAr = new Array();
    for (var s = 0, t = 0; s < strar.length; s++) {
        strar[s] = strar[s].replace(/\(\?[\w-]+\)/g, "");
        strar[s] = strar[s].replace(/\(\?\^:(.*?)\)/g, "$1");

        if (strar[s].length === 0) {
            continue;
        }

        var regex;
        try {
            regex = new RegExp(strar[s], 'i');
        } catch (e) {
            console.error("Invalid regex " + strar[s]);
        }

        if (!regex) {
            continue;
        }

        regAr[t++] = regex;
    }
    return (regAr.length > 0 ? regAr : null);
}

// Converts IP to a base 10 integer
// IP is a string
function convertIp(ip) {
    var octets = ip.split('.');
    if(!areSaneIpValues(octets)) return;

    var num = parseInt(octets[3]);
    // Javascript bitwise operators use 32-bit signed (2's complement) ints
    // so numbers greater than 127 << 24 overflow the sign bit
    // and we want up to at least 256 << 24
    num += parseInt(octets[2]) * (1 << 8);
    num += parseInt(octets[1]) * (1 << 16);
    num += parseInt(octets[0]) * (1 << 24);
    return num;
}

// for debugging purposes - can be removed before release if too slow
function areSaneIpValues(octets) {
    if (octets.length !== 4) {
        printDebugMessage("saneIP: IP value too long");
        return false;
    }
    else {
        for (var i = 0; i < 4; i++) {
            if (parseInt(octets[i]) > 256){
                printDebugMessage("saneIP: Octet " + i + " is too large");
                return false;
            }
            else if (parseInt(octets[i]) < 0){
                printDebugMessage("saneIP: Octet " + i + " is too small (<0)");
                return false;
            }
        }
    }
    return true;
}

// Simplify url
function canonicaliseURL(url) {
    url = unescape(url.replace(/\+/g, " "));
    url = url.replace(/[\x00-\x08\x0e-\x1f\x7f-\xff]/g, "");
    url = url.replace(/\\/g, "");
    return url;
}

function removeURLHash(url) {
    var urlParser = document.createElement('a');
    urlParser.href = url;
    urlParser.hash = '';
    return urlParser.href;
}

// Perform all the netcraft checks to see if the url is ok
function badSite(site, url) {
    if(stringMatchesRegex(buildRegex(list_xss), canonicaliseURL(url))
    && localStorage["xss"] === 'true')
        return cons.errXSS;
    else if(stringMatchesRegex(buildRegex(list_localblock), url)
    && localStorage["suspicious"] === 'true')
        return cons.errSuspicious;
    else if(stringMatchesRegex(cache[site].regex, removeURLHash(url))
    && localStorage["block"] === 'true')
        return cons.errPhish;
    else
        return false;
}

// Check URL logic
function checkURL(site, url) {
    var res;
    // If it is a phish or a suspected XSS attack
    if (res = badSite(site, url)) {
        // Check that we are not forcing a visit
        for (var i = 0; i < cache[site].refs.length; i++) {
            var t = phish[cache[site].refs[i]];
            if (t.link === url && t.force) return cons.noError;
        }
        // Else add it to our list of dodgy urls blocked
        var ref = {
            link: url,
            reason: res,
            force: false
        };
        phish.push(ref); // Can be improved
        cache[site].refs.push(phish.length - 1);
        return res;
    }
    return cons.noError;
}

// Get json data with error checking
function getJsonVar(json, val) {
    if (typeof json != 'object') {
        return "";
    } else if (val in json) {
        return json[val];
    } else {
        return "";
    }
}

// If we do not have site data in the cache initiate it
function initialiseSiteData(site) {
    if (typeof cache[site] === 'undefined') {
        cache[site] = {
            refs: [],
            status: cons.errPending
        };
    }
}

function validDataRetrievalRequest(site){
    // If not valid protocol return
    if (!stringMatchesRegex(validProtocolRegexes, site)) {
        printDebugMessage("Protocol not valid");
        cache[site].status = cons.errNoInfo;
        return false;
    }
    // If we have received more than 3 errors do not make request
    if (errors > 3) {
        printDebugMessage("Too many server errors waiting...");
        cache[site].status = cons.errServer;
        return false;
    }
    return true;
}

function createRequestURL(site, force, subframe, info){
    var nurl = cons.mirror + cons.check + site; // Create check_url url

    // If we have the host IP we will get all the data
    if (typeof cache[site].ip !== 'undefined') {
        var num_ip = convertIp(cache[site].ip);
        if (num_ip !== undefined) {
            nurl += "/" + num_ip;
        } else if (force) nurl += cons.force;
    }
    else if (force) nurl += cons.force; // If we are forcing anyway add tag

    if (subframe)  nurl += cons.embed; // If it is a subframe tell the server
    if (info) nurl += cons.info; // We want all the information

    return nurl;
}

function updateCacheUsingRetrievedInfo(json, status, xhr, site, force) {
    printDebugMessage("updateCache updating " + site);
    if (xhr.status == 204) {
        printDebugMessage("No information available");
        json = {};
    }

    // Get data that does not require DNS lookups
    var pat = atob(getJsonVar(json, "patterns"));
    pat = pat.replace(/\s+$/, '');
    patAr = pat.split(/\t/);
    cache[site].regex = buildRegex(patAr);

    var d = new Date();
    var exp = xhr.getResponseHeader("Expires");
    if (exp) {
        d.setTime(Date.parse(exp));
        printDebugMessage("Cache: ["+site+"] expires: "+exp);
    }
    else {
        printDebugMessage("Cache: ["+site+"] no expires header present: using default");
        d.setTime(d.getTime() + cons.timeout);
    }
    cache[site].expires = d.getTime();

    // If we have the IP or we are forcing get all the other data
    if (force) {
        var data = {};
        for (var i = 0; i < cons.fields.length; i++) {
            var field = cons.fields[i];
            data[field] = getJsonVar(json, field);
        }
        cache[site].data = data;
        cache[site].status = cons.noError;
    }
    else { cache[site].status = cons.errNoDetails; }

    errors = 0;
    printDebugMessage("cache update complete for " + site);
}

// Something went wrong server side
function updateCacheToErrorState (xhr, status, error, site) {
    printDebugMessage("UpdateCache updating to server error");
    if (xhr.getResponseHeader("Content-Type") !== "application/json") {
        // Bad request
        printDebugMessage("Server error or timeout");
        cache[site].status = cons.errServer;
        errors += 1;
    }
    else cache[site].status = cons.errNoInfo;
}

function completeRetrieval(type, site, extraArgs){
    if(type === 'respondToPopUp'){
        respondToPopUpRequest(
            extraArgs.request, site,
            extraArgs.blocked, extraArgs.callbackFunction
        );
    }
    else if(type === 'updateIcon'){
        updateIcon(extraArgs.tab, extraArgs.url);
    }
    else if(type === 'respondToCheck'){
        respondToCheckRequest(
            site, extraArgs.request, extraArgs.callbackFunction
        );
    }
    else if (type !== 'doNothing') {
        printDebugMessage(
            "completeRetrieval in background.js given incorrect type: " + type
            + "\nfor site: " + site
        );
    }
}

// Retrieves data from check_url and parses
function getSiteInfoThen(completionAction, site, force, subframe, info, extraArgs) {
    printDebugMessage("Getting data for: " + site);
    initialiseSiteData(site);
    if(!validDataRetrievalRequest(site)) {
        //respond to popup.js with an error
        completeRetrieval(completionAction, site, extraArgs);
        return;
    }
    // Send request to toolbar.netcraft.com/check_url
    var nurl = createRequestURL(site, force, subframe, info);
    // If we have the host IP we will get all the data
    if (typeof cache[site].ip !== 'undefined') force = true;

    printDebugMessage("Sending AJAX request: " + nurl);

    var network_timer
        = new TrackTiming(cons.gaCategory,
                          'Site data retrieval (from toolbar.netcraft.com)');
    network_timer.start();

    // if we are timing (boolean)
    var timing = typeof extraArgs !== 'undefined' //short circuit
              && typeof extraArgs.processing_timer !== 'undefined';
    if (timing) extraArgs.processing_timer.stop();

    $.ajax({
        type: "GET",
        url:  nurl,
        // Pass scoped 'site' and 'force' variables to functions
        success: function(json, status, xhr){
            network_timer.stop().send();
            if(timing) extraArgs.processing_timer.reStart();

            updateCacheUsingRetrievedInfo(json, status, xhr, site, force);

            if(timing) extraArgs.processing_timer.stop().send();
            printDebugMessage("[JYOT] got the json : " + json);
           // ColorfulTabs.init("5");
        },
        error:   function(xhr, status, error){
            network_timer.stop(); // do not send timing data for errors
            updateCacheToErrorState (xhr, status, error, site);
        },
        complete: function(xhr, status){
            completeRetrieval(completionAction, site, extraArgs);
        }
    });
}

// CHROME API FUNCTION CALLS
// All the following functions interact with the chrome browser

// Helper function to improve readability
function sitesStatusMatches(site, list) {
    for (var i = 0; i < list.length; i++)
        if (cache[site].status === list[i]) return true;
}

// Creates the cache index and divides url
function createLinkAndCacheKey(url) {
    var link = document.createElement('a');
    link.href = url;

    var key = link.protocol + "//" + link.hostname;
    if (link.port !== "") {
        key += ":" + link.port;
    }
    return {key:key, link:link};
}

// Updates the icon for the given tab/URL
function updateIcon(tab, url) {
    var key = createLinkAndCacheKey(url).key;
    var icon = cons.iconNormal;

    if (key in cache && !sitesStatusMatches(key, noDataStatuses) ) {
        if (cache[key].data['heartbleed'] == 'unsafe') {
            icon = cons.iconWarning;
        }
        else if (cache[key].data['pfs'] === '0') {
            icon = cons.iconWarning;
        }
    }

    chrome.browserAction.setIcon({
        tabId: tab,
        path: icon
    });
}

// On every browser request send request to check_url to get patterns
chrome.webRequest.onBeforeRequest.addListener(function (request) {
    printDebugMessage("Request intercepted: " + request.url);
    var key = createLinkAndCacheKey(request.url).key;
    var subframe = request.type == 'sub_frame';
    // If we have not seen site before, or it needs a refresh, get the data
    if (!(key in cache) || sitesStatusMatches(key, [cons.errTimeout, cons.errServer])) {
        getSiteInfoThen('doNothing', key, false, subframe, false);
    } else {
        printDebugMessage("Already have data");
    }
}, {
    urls: ["*://*/*"],
    types: ["main_frame", "sub_frame"]
});

// Every time a request succeded log IP to be used by pop up info
chrome.webRequest.onCompleted.addListener(function (request) {
    printDebugMessage("IP received for host at " + request.url +
        ", will be used for pop up: " + request.ip);
    var key = createLinkAndCacheKey(request.url).key;
    var subframe = request.type == 'sub_frame';
    if (key in cache) {
        cache[key].ip = request.ip;
    }

    // Now we have the IP, force fetching of the rest of the data, if this is
    // the main web page the tab is displaying (i.e. not in a frame.) This is
    // used to update the extension icon to show PFS/not PFS/normal.
    if (!subframe) {
        var extraArgs = { tab: request.tabId, url: request.url };
        getSiteInfoThen('updateIcon', key, true, false, true, extraArgs);
    }
}, {
    urls: ["*://*/*"],
    types: ["main_frame", "sub_frame"]
});

// Chrome has a wacky preloading feature which is implemented with 'pseudo'
// tabs which fire the various webRequest.* events, but aren't real enough for
// browserAction.setIcon to be used. When they turn into a real tab, onReplaced
// is fired, and at this point we want to update the icon.
chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
    chrome.tabs.get(addedTabId, function (tab) {
        updateIcon(addedTabId, tab.url);
    });
});

// updateIcon() must be called each time the tab's page is changed - see
// http://stackoverflow.com/questions/12710061 for an explanation.
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    updateIcon(tabId, tab.url);
});

//  Listens for incoming messages (from popup.js or check.js).
//  return true if the callback function, sendResponse,
// is going to be used asynchronously,
// in order to notify chrome to wait for it.
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        switch (request.type) {
            case cons.reqPopUp:
                if(replyPopUp(request, sendResponse)) return true;
                break;
            case cons.reqBlock:
                replyBlock(request, sendResponse);
                break;
            case cons.reqCheck:
                if(replyCheck(request, sendResponse)) return true;
                break;
            case cons.reqForce:
                replyForce(request, sendResponse);
                break;
            case cons.reqDetails:
                replyDetails(sendResponse);
                break;
            case cons.reqDanger:
                replyDanger(request, sender);
                break;
            case cons.reqPrintTimingData: //debug
                printMessagedTimeData(request);
                break;
        }
    }
);

// PROTOCOL FUNCTIONS
// All the following functions deal with message passing

function respondToPopUpRequest(request, urlCacheKey, blocked, sendResponse) {
    if (cache[urlCacheKey].status === cons.noError) {
        printDebugMessage("Sending data to pop up for " + request.url
            + ": " + JSON.stringify(cache[urlCacheKey].data));
        var curTime = new Date().getTime();
        sendResponse({
            info: JSON.stringify(cache[urlCacheKey].data),
            url: request.url,
            block: blocked,
            messageStartTime: curTime
        });
    }
    else {
        printDebugMessage("Server error");
        var curTime = new Date().getTime();
        sendResponse({
            info: JSON.stringify(cons.errNoInfo),
            url: request.url,
            messageStartTime: curTime
        });
    }
}

// Deal with popup request
function replyPopUp(request, sendResponse) {
    var popup_req_message_timer
        = new TrackTiming(cons.gaCategory,
                          'Popup request message transfer',
                          undefined,
                          request.messageStartTime);
    popup_req_message_timer.stop().send();

    var popup_req_timer
        = new TrackTiming(cons.gaCategory,
                          'background.js popup request processing');
    popup_req_timer.start();

    var parts = createLinkAndCacheKey(request.url);
    var key   = parts.key;
    printDebugMessage("Pop up request for: " + key);

    var viewingBlockedPage =
            chrome.i18n.getMessage("@@extension_id") == parts.link.hostname
        &&  request.url.indexOf("blocked.html")      != -1;
    // If we are viewing a block page show info of blocked url
    if (viewingBlockedPage) {
        var ref = request.url.match(/\d+$/);
        request.url = phish[ref].link;
        parts = createLinkAndCacheKey(request.url);
    }

    printDebugMessage("Getting data for pop up");

    // If we do not have the data get it asynchronously
    if ( !(key in cache) || sitesStatusMatches(key, noDataStatuses) ) {
        printDebugMessage("Data is not available, retrieving");
        var extraArgs = {
            request: request,
            blocked: viewingBlockedPage,
            callbackFunction: sendResponse,
            processing_timer: popup_req_timer
        };
        getSiteInfoThen('respondToPopUp', key, true, false, true, extraArgs);

        // for chrome.runtime.onMessage.addListener:
        // need to return true to keep channel open
        // and allow asynchronous results
        return true;
    }
    else {
        popup_req_timer.stop().send();
        respondToPopUpRequest(request, key, viewingBlockedPage, sendResponse);
        return false;
    }
}

function respondToCheckRequest(urlCacheKey, request, sendResponse) {
    // If we have the regex
    if (sitesStatusMatches(urlCacheKey, [cons.noError, cons.errNoDetails])) {
        var res = checkURL(urlCacheKey, request.url);
        printDebugMessage("Site is: " + res);

        sendResponse({ status: res, ref: (phish.length - 1) });
    }
    else { // Something has gone wrong
        printDebugMessage("Either no info available or server error");
        sendResponse({
            status: cache[urlCacheKey].status
        });
    }
}

// Deal with check request
function replyCheck(request, sendResponse) {
    var key = createLinkAndCacheKey(request.url).key;
    printDebugMessage("Checking URL: " + request.url);
    // If no info, pending or timeout fetch again
    if (!(key in cache) || sitesStatusMatches(key, [cons.errPending, cons.errTimeout])) {
        printDebugMessage("Did not have data, fetching");

        var extraArgs = { request: request, callbackFunction: sendResponse };
        getSiteInfoThen('respondToCheck', key, false, false, false, extraArgs);

        // for chrome.runtime.onMessage.addListener:
        // need to return true to keep channel open
        // and allow asynchronous results
        return true;
    }
    else {
        respondToCheckRequest(key, request, sendResponse);
        return false;
    }
}

// Deal with block request
function replyBlock(request, sendResponse) {
    sendResponse({
        reason: phish[request.ref].reason,
        url: phish[request.ref].link
    });
}

// Deal with force request
function replyForce(request, sendResponse) {
    phish[request.ref].force = true;
    printDebugMessage("Request to force visit: " + phish[request.ref].link);
    sendResponse({
        url: phish[request.ref].link
    });
}

// Deal with details request
function replyDetails(sendResponse) {
    sendResponse({
        name: localStorage["name"],
        email: localStorage["email"]
    });
}

// Deal with danger request
function replyDanger(request, sender) {
    printDebugMessage('replyDanger');
    chrome.browserAction.setIcon({
        tabId: sender.tab.id,
        path: cons.iconDanger
    });
    chrome.browserAction.setTitle({
        tabId: sender.tab.id,
        title: request.msg
    });
}

//  For debug purposes.
//  Prints data to background.js's console,
// to avoid having to keep the popup open to see its console.
//  This is important to time chrome's popup graphical rendering.
function printMessagedTimeData(request){
    var eventName = request.eventName;
    if(typeof request.duration === 'undefined'){
        console.log(eventName + ' ...');
    }
    else {
        console.log(
            eventName + ' complete (' + request.duration + 'ms)'
        );
    }
}

function clearCache(){
    printDebugMessage("Expiring old data, resetting errors and warnings");
    errors = 0;
    var curStamp = new Date().getTime();
    for (var site in cache) {
        if (curStamp > cache[site].expires) {
            cache[site].status = cons.errTimeout;
        }
    }
    for (var i = 0; i < phish.length; i++) {
        phish[i].force = false;
    }
}

// Require site data to be refreshed every 5 minutes
setInterval(clearCache, cons.timeout);

// On install set default options
if (!localStorage["installed"]) {
    localStorage["installed"] = true;
    localStorage["block"] = true;
    localStorage["xss"] = true;
    localStorage["suspicious"] = true;
    localStorage["name"] = "";
    localStorage["email"] = "";
}

browser.runtime.onMessage.addListener((sentMesssage) =>
{
    console.log('got the message: ',sentMessage.actualMessage);
});
