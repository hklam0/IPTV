var NMAFOTTCheckout = {
    _webtvapiHandler: function(a, b) {
        null == a ? b(null) : "SUCCESS" != a.responseCode ? b(null) : b(a)
    },
    ContentTypeVod: "Vod",
    ContentTypeNPVR: "NPVR",
    CheckoutTypeVod: "VOD",
    CheckoutTypeLive: "Live",
    commonVideoUrlFlow: function(a, b, c, d) {
        NMAFNetworking.postRest(NMAFNetworking.translatePatternUrl(b, null), NMAFOTT._appendSessionData(a), function(e) {
            null == e ? d(NMAFErrorCodes.NMAFERR_GEN_NETWORK, null) : "SUCCESS" == e.responseCode ? (e = {
                productId: a.contentId,
                checkoutRequest: a,
                checkoutResponse: {
                    asset: {
                        hls: {
                            adaptive: e.asset
                        }
                    },
                    bookmark: e.bookmark,
                    ccDomain: e.token,
                    ccPoolType: e.pool,
                    keepAliveInterval: e.keepAliveInterval,
                    responseCode: e.responseCode,
                    channelId: e.channelId,
                    subtitle: e.subtitle,
                    subtitles: e.subtitles,
                    drmToken: e.drmToken,
                    vast: e.vast,
                    isStartOver: e.isStartOver,
                    serverReferenceNo: e.serverReferenceNo,
                    isWatermark: e.isWatermark
                },
                checkoutType: c
            },
            d(NMAFErrorCodes.NMAFERR_GEN_SUCCESS, e)) : (e = {
                checkoutResponse: {
                    responseCode: e.responseCode
                }
            },
            d(NMAFErrorCodes.NMAFERR_GEN_API_ERROR, e))
        })
    },
    commonApiFlow: function(a, b, c) {
        NMAFNetworking.postRest(NMAFNetworking.translatePatternUrl(b, null), NMAFOTT._appendSessionData(a), function(d) {
            null == d ? c(NMAFErrorCodes.NMAFERR_GEN_NETWORK, null) : "SUCCESS" == d.responseCode ? c(NMAFErrorCodes.NMAFERR_GEN_SUCCESS, d) : c(NMAFErrorCodes.NMAFERR_GEN_API_ERROR, d)
        })
    },
    getVodUrl: function(a, b, c, d) {
        "undefined" === typeof d && (d = c,
        c = null);
        NMAFOTTCheckout.commonVideoUrlFlow({
            contentId: a,
            contentType: b,
            pin: c
        }, "[ottapi]/getVodURL", NMAFOTTCheckout.CheckoutTypeVod, d)
    },
    getLiveUrl: function(a, b) {
        var data = {
            contentId: a,
            contentType: "Channel"
        }
        if (a == "332") {
            data.audioCode = "N"
        }
        console.log(66, data);

        0 == a.indexOf("HBO") ? NMAFOTTCheckout.commonVideoUrlFlow({
            contentId: a,
            contentType: "Live"
        }, "[ottapi]/getVodURL", NMAFOTTCheckout.CheckoutTypeLive, b) : NMAFOTTCheckout.commonVideoUrlFlow(data, "[ottapi]/getLiveURL", NMAFOTTCheckout.CheckoutTypeLive, b)
    },
    getLiveMatchUrl: function(a, b) {
        NMAFOTTCheckout.commonVideoUrlFlow({
            contentId: a,
            contentType: "npvr"
        }, "[ottapi]/getLiveMatchUrl", NMAFOTTCheckout.CheckoutTypeLive, b)
    },
    getStartOverUrl: function(a, b, c) {
        NMAFOTTCheckout.commonVideoUrlFlow({
            contentId: a,
            contentType: "npvr",
            startTime: b + "0000"
        }, "[ottapi]/getStartoverURL", NMAFOTTCheckout.CheckoutTypeVod, c)
    },
    getSubscriptionMask: function(a) {
        NMAFNetworking.postRest(NMAFNetworking.translatePatternUrl("[ottapi]/getSubscriptionMask", null), NMAFOTT._appendSessionData({}), function(b) {
            null == b ? a(NMAFErrorCodes.NMAFERR_GEN_NETWORK, null) : "SUCCESS" == b.responseCode ? a(NMAFErrorCodes.NMAFERR_GEN_SUCCESS, b) : a(NMAFErrorCodes.NMAFERR_GEN_API_ERROR, b)
        })
    },
    setBookmark: function(a, b, c, d, e, f) {
        f(NMAFErrorCodes.NMAFERR_GEN_SUCCESS, null)
    },
    removeBookmark: function(a, b, c) {
        c(NMAFErrorCodes.NMAFERR_GEN_SUCCESS, null)
    },
    testLog: function() {
        console.log("testLog")
    },
    controlProxyActivateToken: function(a, b) {
        NMAFOTTCheckout.commonApiFlow(NMAFOTT._appendSessionData({
            custId: NMAFOTTID.ottId,
            pool: a.checkoutResponse.ccPoolType,
            token: a.checkoutResponse.ccDomain
        }), "[ctlproxy]/activateToken", b)
    },
    controlProxyKeepAlive: function(a, b) {
        NMAFOTTCheckout.commonApiFlow(NMAFOTT._appendSessionData({
            custId: NMAFOTTID.ottId,
            pool: a.checkoutResponse.ccPoolType,
            token: a.checkoutResponse.ccDomain
        }), "[ctlproxy]/keepAlive", b)
    },
    controlProxyTermToken: function(a, b) {
        NMAFOTTCheckout.commonApiFlow(NMAFOTT._appendSessionData({
            custId: NMAFOTTID.ottId,
            pool: a.checkoutResponse.ccPoolType,
            token: a.checkoutResponse.ccDomain
        }), "[ctlproxy]/termToken", b)
    },
    showHBOPlayer: function(a, b) {
        if ("undefined" === typeof hbogoasia)
            window.alert("Error - HBO SDK not included");
        else if (null == a || null == a.checkoutResponse || null == a.checkoutResponse.asset || null == a.checkoutResponse.asset.hls || null == a.checkoutResponse.asset.hls.adaptive)
            window.alert("Error - Incomplete checkout data");
        else {
            var c = a.checkoutResponse.asset.hls.adaptive;
            if (0 == c.length)
                b(NMAFErrorCodes.NMAFERR_GEN_API_ERROR, "No streaming URL found");
            else {
                var d = c[0];
                if (d.startsWith("hbo://"))
                    if (-1 == d.indexOf("?token="))
                        b(NMAFErrorCodes.NMAFERR_GEN_API_ERROR, "Token not found");
                    else {
                        c = d.lastIndexOf("/") + 1;
                        d = d.substr(c);
                        c = d.indexOf("?");
                        var e = d.substr(0, c);
                        c = d.indexOf("=", c);
                        c = d.substr(c + 1);
                        NMAFLogging.log("contentId=" + e + " jwt=" + c);
                        hbogoasia.init({
                            lang: NMAFLanguageUtils.language,
                            email: NMAFOTTID.loginId,
                            auth_token: c,
                            success: function() {
                                var f = hbogoasia.getContentUrl(e);
                                NMAFLogging.log("hbo auth success, url=" + f);
                                window.open(f, "hbo_player")
                            }
                        });
                        b(NMAFErrorCodes.NMAFERR_GEN_SUCCESS, null)
                    }
                else
                    b(NMAFErrorCodes.NMAFERR_GEN_API_ERROR, "Streaming URL not HBO")
            }
        }
    }
}
  , NMAFOTTID = {
    ottId: null,
    loginId: null,
    logout: function() {
        NMAFOTTID.ottId = null;
        NMAFOTTID.loginId = null;
        NMAFUtilities.removeCookie("loginid");
        NMAFUtilities.removeCookie("ottid");
        $.get({
            url: NMAFNetworking.translatePatternUrl("[ottidform]/logout", "1"),
            async: !1,
            contentType: "text/plain",
            crossDomain: !0,
            xhrFields: {
                withCredentials: !0
            },
            complete: function(a, b) {
                NMAFLogging.log("Logout function returned, status=" + b)
            }
        });
        NMAFLogging.log("Clear cookie");
        NMAFUtilities.removeRawCookieDomainPath("OTTSESSIONID", NMAFNetworking.translatePatternUrl("[ottiddomain]"), "/")
    },
    updateSession: function(a) {
        NMAFNetworking.postRest(NMAFNetworking.translatePatternUrl("[ottapi]/updateSession", "1"), NMAFOTT._appendSessionData({}), function(b) {
            null != b ? "SUCCESS" == b.responseCode ? (NMAFOTTID.loginId = b.email,
            NMAFOTTID.ottId = b.ottUid,
            NMAFUtilities.setCookie("loginid", b.email),
            NMAFUtilities.setCookie("ottid", b.ottUid),
            a(NMAFErrorCodes.NMAFERR_GEN_SUCCESS, b)) : a(NMAFErrorCodes.NMAFERR_GEN_API_ERROR, b) : a(NMAFErrorCodes.NMAFERR_GEN_NETWORK, b)
        })
    },
    restoreSession: function() {
        NMAFOTTID.loginId = NMAFUtilities.getCookie("loginid");
        NMAFOTTID.ottId = NMAFUtilities.getCookie("ottid")
    },
    initialize: function() {
        NMAFOTTID.restoreSession()
    },
    getLoginUrl: function(a) {
        return NMAFOTTID.getLandingUrl(a)
    },
    getRegistrationUrl: function(a) {
        return NMAFNetworking.translatePatternUrl("[ottidform]/regForm?lang=" + NMAFLanguageUtils.language + "&deviceId=" + encodeURIComponent(NMAFUUID.getDeviceUUID()) + "&redirect=" + encodeURIComponent(a))
    },
    getChangePasswordUrl: function(a) {
        return NMAFNetworking.translatePatternUrl("[ottidform]/changePwForm?lang=" + NMAFLanguageUtils.language + "&deviceId=" + encodeURIComponent(NMAFUUID.getDeviceUUID()) + "&redirect=" + encodeURIComponent(a))
    },
    getLandingUrl: function(a) {
        return NMAFNetworking.translatePatternUrl("[ottidform]/landing?lang=" + NMAFLanguageUtils.language + "&deviceId=" + encodeURIComponent(NMAFUUID.getDeviceUUID()) + "&redirect=" + encodeURIComponent(a) + "&mode=prod&template=" + NMAFUUID.getDeviceTypeName())
    },
    getSecureCookie: function() {
        return NMAFUtilities.getRawCookie("OTTSESSIONID")
    },
    getOttId: function() {
        return NMAFOTTID.ottId
    },
    getLoginId: function() {
        return NMAFOTTID.loginId
    },
    getLiveChatUrl: function(a, b) {
        NMAFNetworking.postRest(NMAFNetworking.translatePatternUrl("[ottapi]/getLiveChatUrl", "1"), NMAFOTT._appendSessionData({
            moduleName: a,
            language: NMAFLanguageUtils.language
        }), function(c) {
            null != c ? "SUCCESS" == c.responseCode ? b(NMAFErrorCodes.NMAFERR_GEN_SUCCESS, c.livechatUrl) : b(NMAFErrorCodes.NMAFERR_GEN_API_ERROR, c) : b(NMAFErrorCodes.NMAFERR_GEN_NETWORK, c)
        })
    },
    getUserIdForAnalytics: function() {
        return NMAFOTTID.ottId
    }
}
  , NMAFOTT = {
    NMAFOttInitParam_UseProductionDomains: "NMAFOttInitParam_UseProductionDomains",
    commonCallback: function(a, b) {
        null == a ? b(NMAFErrorCodes.NMAFERR_GEN_NETWORK, null) : "SUCCESS" != a.responseCode ? b(NMAFErrorCodes.NMAFERR_GEN_API_ERROR, b) : b(NMAFErrorCodes.NMAFERR_GEN_SUCCESS, b)
    },
    getModuleInstance: function(a) {
        switch (a) {
        case NMAFFramework.CAPABILITY_CHECKOUT_DOWNLOAD:
            return NMAFOTTCheckout;
        case NMAFFramework.CAPABILITY_USER_IDENTITY:
            return NMAFOTTID
        }
        return null
    },
    initialize: function() {
        var a = NMAFFramework.params.NMAFNInitParam_ApiPrefix;
        "undefined" !== typeof a && null != a && "" != a ? (NMAFNetworking.addUrlPattern("ottapi", a),
        NMAFNetworking.addUrlPattern("subtitle_config", "https://overlayws.nowe.hk/public/16/player_config.json")) : (a = NMAFFramework.params[NMAFOTT.NMAFOttInitParam_UseProductionDomains],
        "Y" == a || "hk" == a ? (NMAFNetworking.addUrlPattern("subtitle_config", "https://overlayws.nowe.hk/public/16/player_config.json"),
        NMAFNetworking.addUrlPattern("ottapi", "https://webtvapi.nowe.hk/16/1"),
        NMAFNetworking.addUrlPattern("ctlproxy", "https://control.nowe.hk/ControlProxy"),
        NMAFNetworking.addUrlPattern("overlay", "https://overlayws.nowe.hk/public/player-overlay"),
        NMAFNetworking.addUrlPattern("ottidform", "https://signin.nowe.hk/ottidform"),
        NMAFNetworking.addUrlPattern("ottiddomain", ".nowe.hk"),
        NMAFNetworking.addUrlPattern("overlayapi", "https://overlayws.nowe.hk/overlayApi")) : "com" == a ? (NMAFNetworking.addUrlPattern("subtitle_config", "https://overlayws.nowe.com/public/16/player_config.json"),
        NMAFNetworking.addUrlPattern("ottapi", "https://webtvapi.nowe.com/16/1"),
        NMAFNetworking.addUrlPattern("ctlproxy", "https://control.nowe.com/ControlProxy"),
        NMAFNetworking.addUrlPattern("overlay", "https://overlayws.nowe.com/public/player-overlay"),
        NMAFNetworking.addUrlPattern("ottidform", "https://signin.nowe.com/ottidform"),
        NMAFNetworking.addUrlPattern("ottiddomain", ".nowe.com"),
        NMAFNetworking.addUrlPattern("overlayapi", "https://overlayws.nowe.com/overlayApi")) : (NMAFNetworking.addUrlPattern("subtitle_config", "https://paidottplayeroverlayws.duckdns.org/public/16/player_config.json"),
        NMAFNetworking.addUrlPattern("ottapi", "https://paidottwebtvapi.duckdns.org/16/1"),
        NMAFNetworking.addUrlPattern("ctlproxy", "https://paidottcontrolproxyv2.duckdns.org/ControlProxy"),
        NMAFNetworking.addUrlPattern("overlay", "https://paidottplayeroverlayws.duckdns.org/public/player-overlay"),
        NMAFNetworking.addUrlPattern("ottidform", "https://id2.now.com/ottidform"),
        NMAFNetworking.addUrlPattern("ottiddomain", ".now.com"),
        NMAFNetworking.addUrlPattern("overlayapi", "https://paidottplayeroverlayws.duckdns.org/overlayApi")));
        "10" != NMAFFramework.params.appId && "undefined" !== typeof NMAFMediaPlayerAnalytics && (NMAFMediaPlayerAnalytics.youbora_accountCode = NMAFFramework.isProductionBuild() ? "pccw" : "pccwdev",
        NMAFMediaPlayerAnalytics.youbora_appId = "Now E Web")
    },
    _appendSessionData: function(a) {
        a.deviceId = NMAFUUID.getDeviceUUID();
        a.deviceType = NMAFUUID.getDeviceType();
		//a.deviceType = "WEB"; 20220916
        a.secureCookie = NMAFUtilities.getRawCookie("OTTSESSIONID");
        a.callerReferenceNo = NMAFUtilities.generateCallerReferenceNo();
        a.profileId = NMAFOTTID.getSecureCookie();
        return a
    },
    matchAlertGetTeamList: function(a) {
        NMAFNetworking.getRest("http://filegateway.nowtv.now.com/shares/sports/team/32.json", function(b) {
            null == b ? a(NMAFErrorCodes.NMAFERR_GEN_NETWORK, null) : a(NMAFErrorCodes.NMAFERR_GEN_SUCCESS, b)
        })
    },
    matchAlertGetFavoriteTeam: function(a) {
        NMAFNetworking.postRest(NMAFNetworking.translatePatternUrl("[ottapi]/matchAlertGetFavoriteTeam", "1"), NMAFOTTID.appendSessionData({}), function(b) {
            NMAFOTT.commonCallback(b, a)
        })
    },
    matchAlertSetFavoriteTeam: function(a, b) {
        NMAFNetworking.postRest(NMAFNetworking.translatePatternUrl("[ottapi]/matchAlertSetFavoriteTeam", "1"), NMAFOTTID.appendSessionData({
            data: a
        }), function(c) {
            NMAFOTT.commonCallback(c, b)
        })
    },
    matchAlertGetNotification: function(a) {
        NMAFNetworking.postRest(NMAFNetworking.translatePatternUrl("[ottapi]/matchAlertGetNotification", "1"), NMAFOTTID.appendSessionData({}), a)
    },
    matchAlertSetNotification: function(a, b) {
        NMAFNetworking.postRest(NMAFNetworking.translatePatternUrl("[ottapi]/matchAlertSetNotification", "1"), NMAFOTTID.appendSessionData({
            enable: a
        }), b)
    },
    getEpgData: function(a, b) {
        NMAFNetworking.getRest(NMAFNetworking.translatePatternUrl("[overlayapi]/getEpgData?contentId=" + a + "&lang=" + NMAFLanguageUtils.language, "1"), function(c) {
            null == c ? b(NMAFErrorCodes.NMAFERR_GEN_NETWORK, null) : null == c.program_schedule ? b(NMAFErrorCodes.NMAFERR_GEN_API_ERROR, c) : b(NMAFErrorCodes.NMAFERR_GEN_SUCCESS, c)
        })
    }
}
  , NMAFMediaPlayerControlProxyV2 = {
    checkoutData: {},
    errCallback: null,
    current: null,
    needKeepAlive: !1,
    keepAliveTimer: 0,
    initWithCheckoutData: function(a) {
        current = this;
        current.checkoutData = a;
        return current
    },
    acquire: function(a) {
        null != current.checkoutData && ("undefined" === typeof current.checkoutData.checkoutResponse.ccDomain || null == current.checkoutData.checkoutResponse.ccDomain ? (current.needKeepAlive = !0,
        current.checkoutData = null,
        a()) : NMAFOTTCheckout.controlProxyActivateToken(current.checkoutData, function(b, c) {
            b == NMAFErrorCodes.NMAFERR_GEN_NETWORK ? (NMAFLogging.log("Activation fails due to network error, returns concurrent error"),
            null != current.errCallback && current.errCallback()) : b == NMAFErrorCodes.NMAFERR_GEN_SUCCESS ? (NMAFLogging.log("Activation successful"),
            current.needKeepAlive = !0,
            current.keepAliveTimer = setTimeout(function() {
                current.keepAlive()
            }, 1E3 * current.checkoutData.checkoutResponse.keepAliveInterval),
            a()) : (NMAFLogging.log("Activation failed (code: " + c.responseCode + "), returns concurrent error"),
            null != current.errCallback && current.errCallback())
        }))
    },
    keepAlive: function() {
        0 != current.keepAliveTimer && clearTimeout(current.keepAliveTimer);
        current.keepAliveTimer = 0;
        null != current.checkoutData && (null == current.errCallback ? (NMAFLogging.log("Control Proxy errCallback is null, forcing termination"),
        current.terminate(function() {})) : (current.needKeepAlive = !1,
        NMAFOTTCheckout.controlProxyKeepAlive(current.checkoutData, function(a, b) {
            a == NMAFErrorCodes.NMAFERR_GEN_SUCCESS ? (NMAFLogging.log("Keepalive successful, schedule to retry"),
            current.keepAliveTimer = setTimeout(function() {
                current.keepAlive()
            }, 1E3 * current.checkoutData.checkoutResponse.keepAliveInterval)) : a == NMAFErrorCodes.NMAFERR_GEN_NETWORK ? (NMAFLogging.log("Keepalive failed due to network error, schedule for retry"),
            current.keepAliveTimer = setTimeout(function() {
                current.keepAlive()
            }, 1E3 * current.checkoutData.checkoutResponse.keepAliveInterval)) : (NMAFLogging.log("Keepalive failed (code: " + b.responseCode + "), returns concurrent error"),
            null != current.errCallback && current.errCallback())
        })))
    },
    terminate: function(a) {
        var b = current.checkoutData;
        current.checkoutData = null;
        0 != current.keepAliveTimer && clearTimeout(current.keepAliveTimer);
        current.keepAliveTimer = 0;
        current.needKeepAlive = !1;
        null == b || null == b.checkoutResponse.ccDomain ? (current.errCallback = null,
        a()) : NMAFOTTCheckout.controlProxyTermToken(b, function(c, d) {
            c == NMAFErrorCodes.NMAFERR_GEN_NETWORK ? NMAFLogging.log("Terminate failed, null response") : c == NMAFErrorCodes.NMAFERR_GEN_SUCCESS ? NMAFLogging.log("Terminate successful") : NMAFLogging.log("Terminate failed: (code: " + d.responseCode + ")");
            a();
            current.errCallback = null
        })
    },
    pause: function() {
        null != current.checkoutData && (NMAFLogging.log("Control Proxy paused, timer=" + current.keepAliveTimer),
        0 != current.keepAliveTimer && clearTimeout(current.keepAliveTimer),
        current.keepAliveTimer = 0)
    },
    resume: function() {
        0 != current.keepAliveTimer && clearTimeout(current.keepAliveTimer);
        current.keepAlive()
    },
    listenConcurrentError: function(a) {
        current.errCallback = a
    }
};
NMAFFramework.bootstrapper = NMAFOTT;
