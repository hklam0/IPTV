var NMAFFramework = {
    CAPABILITY_BOOTSTRAPPER: 1,
    CAPABILITY_USER_IDENTITY: 2,
    CAPABILITY_CONCURRENT_PROXY: 4,
    CAPABILITY_CHECKOUT_DOWNLOAD: 8,
    CAPABILITY_STREAM_DOWNLOADER: 16,
    appId: null,
    appVersion: null,
    initialized: !1,
    buildType: null,
    params: null,
    bootstrapper: null,
    initializeFramework: function(a) {
        NMAFFramework.params = a;
        Object.keys(a).forEach(function(b) {
            "appId" == b ? NMAFFramework.appId = a[b] : "appVersion" == b ? NMAFFramework.appVersion = a[b] : "buildType" == b ? NMAFFramework.buildType = a[b] : "language" == b && (NMAFLanguageUtils.language = a[b])
        });
        NMAFnowID.nowId = NMAFUtilities.getCookie("loginid");
        "undefined" !== typeof NMAFOTTID && NMAFOTTID.initialize();
        "undefined" !== typeof NMAFOTT && NMAFOTT.initialize()
    },
    isProductionBuild: function() {
        return "Production" == NMAFFramework.buildType
    },
    getModuleInstance: function(a) {
        return NMAFFramework.bootstrapper.getModuleInstance(a)
    }
}
  , NMAFErrorCodes = {
    NMAFERR_GEN_SUCCESS: 0,
    NMAFERR_GEN_API_ERROR: 3,
    NMAFERR_GEN_NETWORK: 1,
    NMAFERR_PLAYER_GENERIC: 10007,
    NMAFERR_PLAYER_CONCURRENT: 80025
}
  , NMAFLogging = {
    log: function(a) {
        "Production" != NMAFFramework.buildType && console.log(a)
    }
}
  , NMAFLanguageUtils = {
    language: null
}
  , NMAFUtilities = {
    setCookie: function(a, b) {
        document.cookie = "NMAF_" + a + "=" + b
    },
    getCookie: function(a) {
        return NMAFUtilities.getRawCookie("NMAF_" + a)
    },
    getRawCookie: function(a) {
        return (a = document.cookie.match("(^|;) ?" + a + "=([^;]*)(;|$)")) ? a[2] : null
    },
    removeCookie: function(a) {
        document.cookie = NMAFUtilities.removeRawCookie("NMAF_" + a)
    },
    removeRawCookie: function(a) {
        var b = new Date;
        b.setTime(b.getTime() - 1);
        document.cookie = a + "=;expires=" + b.toUTCString()
    },
    removeRawCookieDomainPath: function(a, b, d) {
        var c = new Date;
        c.setTime(c.getTime() - 1);
        document.cookie = a + "=;domain=" + b + ";path=" + d + ";expires=" + c.toUTCString()
    },
    generateCallerReferenceNo: function() {
        return "W" + Date.now() + (Math.floor(900 * (1 + Math.random())) + 100)
    }
}
  , NMAFNetworking = {
    patterns_off: {
        webtvapi: "https://npxapi.nowtv.now.com",
        prefix_webtvapi: "[webtvapi]/[appId]/[version]",
        nowid: "https://id.now.com"
    },
    patterns: {
        webtvapi: "http://localtest.now.com",
        prefix_webtvapi: "[webtvapi]/[appId]/[version]",
        nowid: "https://id.now.com"
    },
    translatePatternUrl: function(a, b) {
        for (var d = !0, c = a, e; d; )
            d = !1,
            Object.keys(this.patterns).forEach(function(a) {
                e = c;
                c = c.replace("[" + a + "]", NMAFNetworking.patterns[a]);
                e != c && (d = !0)
            });
        null != b && (c = c.replace("[version]", b));
        return c = c.replace("[appId]", NMAFFramework.appId)
    },
    defaultUserAgent: function() {
        return navigator.userAgent
    },
    postRest: function(a, b, d) {
        "string" == typeof b ? $.ajax({
            type: "POST",
            url: a,
            data: b,
            complete: function(a) {
                d(a.responseJSON)
            },
            dataType: "json"
        }) : $.ajax({
            type: "POST",
            contentType: "application/json",
            url: a,
            data: JSON.stringify(b),
            complete: function(a) {
                d(a.responseJSON)
            },
            dataType: "json"
        })
    },
    getRest: function(a, b) {
        $.ajax({
            type: "GET",
            contentType: "application/json",
            url: a,
            complete: function(a) {
                b(a.responseJSON)
            },
            dataType: "json"
        })
    },
    addUrlPattern: function(a, b) {
        NMAFNetworking.patterns[a] = b
    }
}
  , NMAFAppVersionDataUtils = {
    updateApplicationInfoData: function(a) {
        NMAFNetworking.postRest(NMAFNetworking.translatePatternUrl("[webtvapi]/[appId]/[version]/getAppInfo", "1"), {
            deviceType: "ANDROID",
            appVersion: NMAFFramework.appVersion,
            callerReferenceNo: NMAFUtilities.generateCallerReferenceNo()
        }, a)
    }
}
  , NMAFUUID = {
    _uuid: null,
	_deviceType: "WEB", //20220915
    _s4: function() {
        return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1)
    },
    getDeviceUUID: function() {
        NMAFUUID._uuid = NMAFUtilities.getCookie("uuid");
        if (null == NMAFUUID._uuid) {
            var a = Math.floor(Date.now() / 1E3).toString(16);
            NMAFUUID._uuid = "W-" + a + "-" + NMAFUUID._s4() + "-" + NMAFUUID._s4() + "-" + NMAFUUID._s4() + "-" + NMAFUUID._s4() + NMAFUUID._s4();
            NMAFUtilities.setCookie("uuid", NMAFUUID._uuid)
        }
        return NMAFUUID._uuid
    },
    getDeviceName: function() {
        return ""
    },
    getDeviceType: function() {
		//20220915
		//return "web"
        //return NMAFUUID._deviceType
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return "IOS_PHONE";
        }
        return "WEB";        
    },
    getDeviceTypeName: function() {
        return "WEB"
    }
}
  , NMAFnowID = {
    nowId: null,
    fsa: null,
    login: function(a, b, d) {
        NMAFNetworking.postRest(NMAFNetworking.translatePatternUrl("[nowid]/nowidform/login", null), {
            nowid: a,
            password: b,
            deviceID: NMAFUUID.getDeviceUUID()
        }, d)
    },
    logout: function() {
        NMAFnowID.nowId = null;
        NMAFUtilities.removeCookie("loginid");
        NMAFUtilities.removeRawCookie("NOWSESSIONID")
    },
    updateSession: function(a) {
        NMAFNetworking.postRest(NMAFNetworking.translatePatternUrl("[webtvapi]/[appId]/[version]/updateSession", "1"), NMAFnowID.appendSessionData({}), function(b) {
            null != b && (NMAFnowID.nowId = b.loginid,
            NMAFUtilities.setCookie("loginid", b.loginid));
            a(b)
        })
    },
    getLoginUrl: function(a) {
        return NMAFNetworking.translatePatternUrl("[nowid]/nowidform/login.form?lang=" + NMAFLanguageUtils.language + "&redirect=" + a)
    },
    appendSessionData: function(a) {
        a.profileDeviceId = "";
        a.profileVersion = "2";
        a.profileType = "NOW";
        a.profileId = NMAFUtilities.getRawCookie("NOWSESSIONID");
        a.callerReferenceNo = NMAFUtilities.generateCallerReferenceNo();
        return a
    },
    needFSA: function(a) {
        null == NMAFnowID.fsa ? NMAFnowID.updateSession(function(b) {
            null != b && null != b.fsa ? (NMAFnowID.fsa = b.fsa,
            a(!0)) : a(!1)
        }) : a(!0)
    }
};
