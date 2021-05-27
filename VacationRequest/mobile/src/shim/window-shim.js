if (typeof window.location === 'undefined') {
    window.location = {
        host: 'localhost',
    };
}

if (typeof window.document === 'undefined') {
    window.document = {};
}

if (typeof document.cookie === 'undefined') {
    document.cookie = '';
}

/*
 * Based on: http://www.quirksmode.org/js/cookies.html
 * and https://github.com/wojodesign/local-storage-js/blob/master/storage.js
 * and https://gist.github.com/350433
 * License: http://www.opensource.org/licenses/MIT
 */
(function (window) {
    'use strict';
    window.sessionStorage = window.sessionStorage || {
        length: 0,
        setItem: function (key, value) {
            document.cookie = key + '=' + value + '; path=/';
            this.length++;
        },
        getItem: function (key) {
            const keyEQ = key + '=';
            const ca = document.cookie.split(';');
            let i = 0;
            const len = ca.length;
            for (; i < len; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(keyEQ) === 0) {
                    return c.substring(keyEQ.length, c.length);
                }
            }
            return null;
        },
        removeItem: function (key) {
            this.setItem(key, '', -1);
            this.length--;
        },
        clear: function () {
            // Caution: will clear all persistent cookies as well
            const ca = document.cookie.split(';');
            let i = 0;
            const len = ca.length;
            for (; i < len; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1, c.length);
                }
                const key = c.substring(0, c.indexOf('='));
                this.removeItem(key);
            }
            this.length = 0;
        },
        key: function (n) {
            const ca = document.cookie.split(';');
            if (n >= ca.length || isNaN(parseFloat(n)) || !isFinite(n)) {
                return null;
            }
            let c = ca[n];
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length);
            }
            return c.substring(0, c.indexOf('='));
        }
    };
})(window);
