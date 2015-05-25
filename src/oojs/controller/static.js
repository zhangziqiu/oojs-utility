/*
127.0.0.1:8080/person/zzq/30.html?c=2
*/
oojs.define({
    name: 'static',
    namespace: 'oojs.controller',
    deps: {
        fileSync: 'oojs.utility.fileSync',
        fs: require('fs'),
        path: require('path'),
        string: 'oojs.utility.string'
    },
    mimeType: {
        "css": "text/css",
        "gif": "image/gif",
        "html": "text/html",
        "htm": "text/html",
        "ico": "image/x-icon",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "js": "text/javascript",
        "json": "application/json",
        "pdf": "application/pdf",
        "png": "image/png",
        "svg": "image/svg+xml",
        "swf": "application/x-shockwave-flash",
        "tiff": "image/tiff",
        "txt": "text/plain",
        "wav": "audio/x-wav",
        "wma": "audio/x-ms-wma",
        "wmv": "video/x-ms-wmv",
        "xml": "text/xml"
    },
    render: function (context) {
        var  request = context.request;
        var  response = context.response;

        var  basePath = process.cwd();
        var  filePath = basePath + context.url.origin;
        filePath = basePath + '/' + context.url.path.join('/');
        
        //检查文件或文件夹是否存在
        if(!this.fs.existsSync(filePath)){
            response.writeHead(404, {
                'Content-Type': this.mimeType['html']
            });
            response.end();
            return;
        }

        var  fileStat = this.fs.statSync(filePath);
        if (fileStat.isDirectory()) {
            //处理文件夹
            var  result = [];
            var  itemTemplate = '<a href="{{href}}">{{name}}</a><br/>';
            var  fileList = this.fileSync.getFileListSync(filePath, { recursion:1 });
            var  fileDirectoryList = this.fileSync.getDirectoryListSync(filePath, { recursion:1 });
            
            //获取文件夹
            for (var  i = 0, count = fileDirectoryList.length; i < count; i++) {
                var  tempFileHref = this.path.relative( process.cwd(),  fileDirectoryList[i]);
                tempFileHref = '/' + tempFileHref.replace(/\\/gi, '\/');
                var  tempFileName = this.path.basename(fileDirectoryList[i]);
                var  tempData = {};
                tempData.href = tempFileHref;
                tempData.name = tempFileName;                
                result.push( this.string.template(itemTemplate, tempData));
            }
            
            
            //获取文件
            for (var  i = 0, count = fileList.length; i < count; i++) {
                var  tempFileHref = this.path.relative( process.cwd(),  fileList[i]);
                tempFileHref = '/' + tempFileHref.replace(/\\/gi, '\/');
                var  tempFileName = this.path.basename(fileList[i]);
                var  tempData = {};
                tempData.href = tempFileHref;
                tempData.name = tempFileName;                
                result.push( this.string.template(itemTemplate, tempData));
            }
            
            
            response.writeHead(200, {
                'Content-Type': this.mimeType['html']
            });
            response.write(result.join(''));

        }
        else {
            //处理文件
            var  fileExt = this.path.extname(filePath).toLowerCase();
            fileExt = fileExt.slice(1);
            var  fileMime = this.mimeType[fileExt] || 'text/plain';
            var  file = this.fs.readFileSync(filePath);
            response.writeHead(200, {
                'Content-Type': fileMime
            });
            response.write(file, "binary");
        }
        response.end();
    }
});