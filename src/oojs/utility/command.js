/**
 @class command
 @classdesc 处理命令行的命令和参数
 */
oojs.define({
    name: 'command',
    namespace: 'oojs.utility',
    /**
     @param {Array} args 包含option的array对象
     @return {Object} 一个对象, command属性为命令数组, option属性为参数的mapping对象.
     */
    getCommand: function (option) {
        var commandArray = [];
        option = option || {};
        //命令深度, 即支持几级命令. 
        //比如二级命令: oojs smart a.js, 其中oojs是一级命令, smart是二级命令, a.js是参数而不是命令.
        //a.js会保存到option.values中
        option.commandDepth = option.commandDepth || 1;

        //所有的参数
        args = option.args || process.argv;
        //选项参数
        var optionArray = args.concat();

        for (var i = 0, count = args.length; i < count; i++) {
            if (!args[i] || args[i].indexOf('-') === 0) {
                break;
            }
            // node 4.0版本后, 全剧命令第一个参数从node改成了"c:/document/node.exe"的形式
            if (args[i] !== 'node' && !(/node\.exe$/gi.test(args[i]))) {
                commandArray.push(args[i]);
            }
            optionArray.shift();
        }

        var optionMapping = this.parseOptions(optionArray);

        //从命令数组中识别命令与参数
        if (commandArray.length > option.commandDepth) {
            var valueFromCommand = [];
            for (var i = commandArray.length - 1, count = option.commandDepth - 1; i > count; i--) {
                valueFromCommand.push(commandArray[i]);
                commandArray.pop();
            }
            valueFromCommand = valueFromCommand.reverse();
        }
        optionMapping.values = optionMapping.values || [];
        optionMapping.values = optionMapping.values.concat(valueFromCommand);

        var result = {
            command: commandArray,
            option: optionMapping
        };
        return result;
    },

    /**
     @param {Array} optionArray 包含option的array对象
     @return {Object} 一个mapping对象, key为参数名, value为参数值. 对象有一个特殊属性values数组, 存储不属于任何参数的值
     */
    parseOptions: function (optionArray) {
        var result = {
            values: []
        };

        //参数名
        var optionName;
        //参数值
        var optionValue;
        for (var i = 0, count = optionArray.length; i < count;) {
            optionName = optionArray[i];
            optionValue = optionArray[i + 1];
            if (optionName.indexOf('--') === 0) {
                //--n=0
                optionName = optionName.substring(2);
                var tempArray = optionName.split('=');
                optionName = tempArray[0];
                optionValue = tempArray[1];
                result[optionName] = optionValue;
                i++;
            }
            else if (optionName.indexOf('-') === 0) {
                //-n 或者 -n 0
                optionName = optionName.substring(1);
                if (optionValue && optionValue.indexOf('-') > -1) {
                    //-n
                    optionValue = true;
                    i++;
                }
                else {
                    //-n 0
                    i = i + 2;
                }
                result[optionName] = optionValue;
            }
            else {
                //n
                result.values.push(optionName);
                i++;
            }
        }
        return result;
    }
});