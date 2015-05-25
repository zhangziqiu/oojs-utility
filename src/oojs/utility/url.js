/*
the fastest url parser in the world.

benchmark:
parseQueryString:false
misc/url.js node-core-url parse(): 6485  qps/second
misc/url.js urlparser parse(): 160675  qps/second
misc/url.js oojs-utility-url parse(): 437409  qps/second

parseQueryString:true
misc/url.js node-core-url parse(): 5329  qps/second
misc/url.js urlparser parse(): 51275  qps/second
misc/url.js oojs-utility-url parse(): 182057  qps/second

*/
oojs.define({
    name: 'url',
    namespace: 'oojs.utility',

    $url: function () {
        try{
            this.originUrl = require('url');
        }
        catch(ex){
            this.originUrl = false;
        }
        
    },

    /*
    url: 待解析的url.
    parseQueryString: 是否解析QueryString参数.
    startAtPath: 是否从path开始. 如果是'/a/b.html'这种形式的url, 则需要传递true
    */
    parse: function (url, parseQueryString, startAtPath) {
        if (typeof url !== "string") {
            throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
        }

        //http://www.aaa.com:8080/b/c/d.html?e=1&f=2#ggg
        //http://www.aaa.com:8080/b/c/d.html?e=1&f=2
        var  start = 0;
        var  end = url.length - 1;
        var  result = { origin:url };
        parseQueryString = typeof parseQueryString === 'undefined' ? true : parseQueryString;

        //Trim leading and trailing ws
        while (url.charCodeAt(start) <= 0x20 /*' '*/ ) start++;
        while (url.charCodeAt(end) <= 0x20 /*' '*/ ) end--;

        if(!startAtPath){
            //process protocal
            for (var  i = start; i <= end; ++i) {
                if (url.charCodeAt(i) === 0x3A /*':'*/ ) {
                    result.protocol = url.slice(start, i);
                    start = i + 3;
                    break;
                }
            }

            //process host
            var  matchPort = false;
            for (var  i = start; i <= end; ++i) {
                var  ch = url.charCodeAt(i);
                if (ch === 0x2F /*'/'*/ ) {
                    if (matchPort) {
                        result.port = url.slice(start, i);
                    }
                    else {
                        result.host = url.slice(start, i);
                    }
                    start = i + 1;
                    break;
                }
                else if (ch === 0x3A /*':'*/ ) {
                    result.host = url.slice(start, i);
                    start = i + 1;
                    matchPort = true;
                }
            }
        }
        
        //process path and querytring
        if (parseQueryString) {
            //Trim leading '/'
            while (url.charCodeAt(start) === 0x2F /*' '*/ ) start++;
        
            var  pathArray = [];
            var  pathEnd = false;
            var  queryEnd = false;
            var  query = {};
            var  queryName;
            var  queryValue;
            var  ch;
            end = end + 1;

            for (var  i = start; i <= end; ++i) {
                if (i === end) {
                    if (pathEnd) {
                        if (queryEnd) {
                            result.anchor = url.slice(start, i);
                            ch = 0x5E; //'^'
                        }
                        else {
                            ch = 0x26; //'&'
                        }
                    }
                    else {
                        ch = 0x3F; //'?'
                    }

                }
                else {
                    ch = url.charCodeAt(i);
                }

                switch (ch) {
                    case 0x2F:
                        pathArray.push(url.slice(start, i));
                        start = i + 1;
                        break;
                    case 0x3F:
                        pathEnd = true;
                        var  currentPath = url.slice(start, i);
						//设置默认文档
						/*
                        if(!currentPath || currentPath.length<0){                            
							currentPath = 'index.html';
                        }
						*/
                        pathArray.push(currentPath);
                        start = i + 1;
                        break;
                    case 0x3D:
                        queryName = url.slice(start, i);
                        start = i + 1;
                        break;
                    case 0x23:
                        if (!pathEnd) {
                            pathEnd = true;
                            queryEnd = true;
                            pathArray.push(url.slice(start, i));
                            start = i + 1;
                            break;
                        }
                        pathEnd = true;
                        queryEnd = true;
                    case 0x26:
                        queryValue = url.slice(start, i);
                        if (queryName) {
                            if (typeof query[queryName] !== 'undefined') {
                                //url传递数组
                                if (query[queryName] instanceof Array) {
                                    query[queryName].push(queryValue);
                                }
                                else {
                                    query[queryName] = [query[queryName], queryValue];
                                }
                            }
                            else {
                                query[queryName] = queryValue;
                            }
                        }
                        else {
                            query[queryValue] = true;
                        }
                        start = i + 1;
                        queryName = undefined;
                        break;
                }
            }

            //end
            result.path = pathArray;
            result.query = query;
        }
        
        return result;
    },

    format: function (urlObj) {
        if( this.originUrl ){
            return this.originUrl.format(urlObj);
        }
        else{
            throw new Error("format method only supported in nodejs");
        }
        
    },

    resolve: function (from, to){
        if( this.originUrl ){
            return this.originUrl.resolve(from, to);
        }
        else{
            throw new Error("resolve method only supported in nodejs");
        }
    }

});