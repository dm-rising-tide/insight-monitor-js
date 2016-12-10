/* 
* @Author: 陈能堡 - Rising Tide
  @GitHub: https://github.com/chennengbao
* @Date:   2016-12-08 19:06:07
* @Last Modified by:   陈能堡 - 梦幻雪冰
* @Last Modified time: 2016-12-10 01:22:40
*
* @main 主函数
* @detector 数据监测
* @firstLoad 首次加载需发送设备信息和记录cookie
* @sendData 发送数据
* @joinPara 参数拼接
* @newRequest 创建请求
* @detectionEleType 判断检测的标签类型
* @getClickVal 获取按钮的值
* @createUUID 生成GUID
* @setCookie 设置cookie 
* @getCookie 获取cookie 
* @addEvent 绑定事件 
* @removeEvent 移除事件 
* @getTimesTamp 获取时间戳 
* @ready 页面加载状态 
* @getSiblingsEle 获取元素的兄弟级 
* @getHotKeyByKeyCode 根据keyCode的值筛选出快捷键
*/
// 关闭页面进行数据监测
!function() {
    /*****************配置信息*****************/ 
    // 配置信息
    var config = {
        global: window, 
        // 监测UV使用
        uvid: 'tideUvId', 
        // 监测PV使用
        pvid: 'tidePvId', 
        // 监测对象类型
        detecEleType: ['button', 'input', 'a', 'select', 'textarea', 'i', 'embed'],
        // cookie的有效时间
        expires: 315360000000, 
        // 1px图片地址
        gifSrc: 'http://10.0.0.206:9980/img/tz.gif?', 
    },
    // 设备信息
    deviceInfo = {
        // 设备是否支持cookie
        cookieEnabled: navigator.cookieEnabled,
        // 浏览器使用的语言
        language: navigator.language || navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage || "",
        // 屏幕大小
        screenSize: (window.screen.width || 0) + "x" + (window.screen.height || 0),
        // 设备像素比
        dpi: window.devicePixelRatio,
        colorDepth: window.screen.colorDepth
    },
    // 临时存储数据
    dataStorage = {
        tempUvID: 0,
        tempPvID: 0,
        hasCookie: false,
        pageId: 0
    };

    /*****************监测数据主功能*****************/ 
    function Domob() {
        dataStorage.pageId = (this.createUUID() + '-' + this.getTimesTamp()) + '-' + (Math.random()).toString().substr(2);

        this.main();
    }

    /*
     * [main 主函数]
     * @return {[type]} [description]
     */
    Domob.prototype.main = function() {
        this.detector();
        this.ready();
    }

    /*
     * [detector 数据监测]
     * @return {[type]} [description]
     */
    Domob.prototype.detector = function() {
        var _this = this;

        function comEventHandler(e) {
            var targetEle   = e.target,
                eventType   = e.type,
                tempData    = [],
                nodeName    = targetEle.nodeName.toLowerCase();

            if (_this.detectionEleType(nodeName)) {
                console.log(eventType + '&' + nodeName);
                switch(true) {
                    case new RegExp(eventType + '&' + nodeName, 'g').test(['focusin&input', 'focusin&a', 'focusin&button', 'focusin&textarea', 'focusin&select', 'focusin&i', 'focusin&embed'].join('')):
                        _this.sendData({
                            'type': nodeName,
                            'name': targetEle.name,
                            'id': targetEle.id,
                            'className': targetEle.className,
                            'btnText': _this.getClickVal(targetEle, nodeName),
                            'eleType': targetEle.type,
                            'referrer': escape(document.referrer) 
                        });                      
                    break;              
                }
            };
        }

        // 鼠标操作
        this.addEvent(document, 'focusin', comEventHandler, false);
    }

    /*
     * [firstLoad 首次加载需发送设备信息和记录cookie]
     * @return {[type]} [description]
     */
    Domob.prototype.firstLoad = function() {
         // 判断是否是首次加载
        if (!this.getCookie(config.uvid)) {
            this.setCookie(config.uvid);
            dataStorage.hasCookie = true;
            dataStorage.tempUvID = this.getCookie(config.uvid);
            // 发送设备信息
            this.sendData(deviceInfo);
        } else {
            dataStorage.hasCookie = true;
            dataStorage.tempUvID = this.getCookie(config.uvid);
        }
    }

    /*****************监测辅助功能函数*****************/ 
    /*
     * [sendData 发送数据]
     * @param  {[type]} paraObj [对象]
     * @return {[type]}         [description]
     */
    Domob.prototype.sendData = function(paraObj) {
        var para = this.joinPara(arguments).replace(/\:(?=(,))/gi,':"null"');
        this.newRequest(para);
    }

    /*
     * [joinPara 参数拼接]
     * @param  {[type]} paraObj [对象]
     * @return {[type]}         [请求字符串]
     */
    Domob.prototype.joinPara = function(paraObj) {
        var len     = paraObj.length,
            result  = [];

        for (var i = 0; i < len; i++) {
            var tempData    = paraObj[i],
                str         = '';

            for (var key in tempData) {
                if (tempData[key]) {
                    str += '"' + key + '":' + '"' + tempData[key] + '",'
                };
            };

            result.push('{' + str.replace(/,$/g, '') + '}');
        };

        return 'data=[' + result.toString() + ']&' 
                + config.uvid + '=' + dataStorage.tempUvID + '&'
                + config.pvid + '=' + dataStorage.pageId
                + '&date=' + this.getTimesTamp();
    }

    /*
     * [newRequest 创建请求]
     * @param  {[type]} para [对象]
     * @return {[type]}      [description]
     */
    Domob.prototype.newRequest = function (para) {
        var img = new Image();

        console.log('发送数据' + config.gifSrc + para);
        img.src = config.gifSrc + para;
    }

    /*
     * [detectionEleType 判断检测的标签类型]
     * @param  {[type]} eleType [标签类型]
     * @return {[type]}         [布尔值]
     */
    Domob.prototype.detectionEleType = function(eleType) {
        var str = config.detecEleType.toString().replace(/,/g, '-');

        return new RegExp('(^|-)' + eleType + '($|-)', 'g').test(str);
    }

    /*
     * [getClickVal 获取按钮的值]
     * @param  {[type]} eleObj [标签对象]
     * @param  {[type]} type   [标签类型]
     * @return {[type]}        [文本内容]
     */
    Domob.prototype.getClickVal = function(eleObj, type) {
        var resultStr = '';

        switch(type) {
            case 'button': resultStr = eleObj.innerHTML; break;
            case 'input': 
                if (eleObj.type != 'text' && eleObj.type != 'password') {
                    resultStr = eleObj.value; 
                    if (eleObj.type == 'checkbox' || eleObj.type == 'radio') {
                        resultStr = this.getSiblingsEle(eleObj, 'label')[0].innerHTML;
                    }                 
                };
                break;
            case 'a': resultStr = eleObj.innerHTML; break;
            case 'textarea': resultStr = ''; break;
        }

        return escape(resultStr);
    }

    /*
     * [createUUID 生成GUID]
     * @return {[type]} [GUID]
     */
    Domob.prototype.createUUID = function() {
        return tideid.create();
    }

    /*
     * [setCookie 设置cookie]
     * @param {[type]} cookieName [cookie的name值]
     */
    Domob.prototype.setCookie = function(cookieName) {
        var nowDate = new Date();

        nowDate.setTime(nowDate.getTime() + config.expires);
        document.cookie = cookieName + '=' + this.createUUID() + ';path=/;expires=' + nowDate.toGMTString(); 
    }

    /*
     * [getCookie 获取cookie]
     * @param  {[type]} cookieName [cookie的name值]
     * @return {[type]}            [返回cookie的值]
     */
    Domob.prototype.getCookie = function(cookieName) {
        var cookieStr   = document.cookie,
            result      = [];

        return (result = new RegExp("(^| )" + cookieName + "=([^;]*)(;|$)").exec(cookieStr)) ? result[2] : null;;
    }

    /*
     * [addEvent 绑定事件]
     * @param {[type]}   obj       [标签对象]
     * @param {[type]}   eventName [事件类型]
     * @param {Function} fn        [处理函数]
     * @return {[type]}            [description]
     */
    Domob.prototype.addEvent = function(obj, eventName, fn){
        if (obj.addEventListener) {
            obj.addEventListener(eventName, fn, false);
        } else{
            obj.attachEvent("on" + eventName, function(){
                // 修改指向
                fn.call(obj);
                return fn;
            })
        };
    }

    /*
     * [removeEvent 移除事件]
     * @param  {[type]}   obj       [标签对象]
     * @param  {[type]}   eventName [事件类型]
     * @param  {Function} fn        [处理函数]
     * @return {[type]}             [description]
     */
    Domob.prototype.removeEvent = function(obj, eventName, fn){
        if (obj.removeEventListener) {
            obj.removeEventListener(eventName, fn, false);
        } else {
            obj.detachEvent('on' + eventName, fn);
        }
    }

    /*
     * [getTimesTamp 获取时间戳]
     * @return {[type]} [时间戳]
     */
    Domob.prototype.getTimesTamp = function() {
        return (new Date()).getTime();
    }

    /*
     * [ready 页面加载状态]
     * @return {[type]} [description]
     */
    Domob.prototype.ready = function() {
        var _this = this;

        // 页面首次加载
        this.firstLoad();

        function handler(e) {
            // interactive - 已加载，文档与用户可以开始交互
            if (document.readyState === 'interactive') {
                // 发送页面加载状态
                _this.sendData({
                    'webStatus': 'interactive',
                    'pageTitle': escape(document.title),
                    'loadTime': _this.getTimesTamp() - _tide.start
                });  
            };
            // complete - 载入完成
            if (document.readyState === 'complete') {
                // 发送页面加载状态
                _this.sendData({
                    'webStatus': 'complete',
                    'pageTitle': escape(document.title),
                    'loadTime': _this.getTimesTamp() - _tide.start
                });  
                // 移除事件
                _this.removeEvent(document, 'readystatechange', handler);                            
            };
        }

        this.addEvent(document, 'readystatechange', handler);            
    }

    /*
     * [getSiblingsEle 获取元素的兄弟级]
     * @param  {[type]} eleObj  [标签对象]
     * @param  {[type]} eleType [标签类型]
     * @return {[type]}         [标签对象]
     */
    Domob.prototype.getSiblingsEle = function(eleObj, eleType) {
        var eleArr      = eleObj.parentNode.childNodes,
            len         = eleArr.length,
            reslutArr   = [];

        for (var i = 0; i < len; i++) {
            if (eleArr[i].nodeName.toLowerCase() == eleType) {
                reslutArr.push(eleArr[i]);
            };
        };
        
        return reslutArr;
    }

    /*
     * [getHotKeyByKeyCode 根据keyCode的值筛选出快捷键]
     * @param  {[type]} key [键码值]
     * @return {[type]}     [键码值]
     */
    Domob.prototype.getHotKeyByKeyCode = function (key) {
        if (key > 65 && key < 90) {
            return '';
        };

        if (key > 48 && key < 57) {
            return '';
        };
        if (key > 96 && key < 107) {
            return '';
        };

        return key;
    }

    /*****************UUID主功能*****************/ 
    function uuid() {
        return uuid.create();
    }

    uuid.create = function() {
        var bytes = uuid.createBinary();
        return uuid.parseBinary(bytes);
    };

    uuid.createBinary = function() {
        // version 4
        var bytes = _getRandomBytes();
        bytes[6] = bytes[6] & 0x0f | 0x40;
        bytes[8] = bytes[8] & 0x3f | 0x80;
        return bytes;
    };

    uuid.parseBinary = function(bytes) {
        var result = '';
        for (var i = 0; i < 16; i++) {
            if (i === 4 || i === 6 || i === 8 || i === 10) {
                result += '-';
            }
            result += _toHex(bytes[i]);
        }
        return result;
    };

    var BufferView = config.global.Uint8Array || Buffer || Array;

    var _getRandomBytes;
    if ( typeof require === 'function') {
        _getRandomBytes = function() {
            return require('crypto').randomBytes(16);
        };
    } else if (config.global.crypto && crypto.getRandomValues) {
        _getRandomBytes = function() {
            var bytes = new Uint8Array(16);
            return crypto.getRandomValues(bytes);
        };
    } else {
        _getRandomBytes = function() {
            var bytes = [];
            for (var i = 0; i < 16; i++) {
                bytes[i] = (Math.random() * 256) | 0;
            }
            return bytes;
        };
    }

    function _toHex(number) {
        var hex = Number(number).toString(16);
        if (hex.length & 1) {
            return '0' + hex;
        }
        return hex;
    }

    function _toNumber(hex) {
        return parseInt(hex, 16);
    }

    config.global.tideid = uuid;
    /*****************实例化功能*****************/ 
    new Domob();
}();


