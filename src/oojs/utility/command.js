/**
@class command
@classdesc 处理命令行的命令和参数
*/
define && define({
    name: 'command',
    namespace: 'oojs.utility',
    /**
    @param {Array} args 包含option的array对象
    @return {Object} 一个对象, command属性为命令数组, option属性为参数的mapping对象.
    */
    getCommand: function (args) {
        var commandArray = [];
        //所有的参数
        args = args || process.argv;
        //选项参数
        var optionArray = args.concat();

        for (var i = 0, count = args.length; i < count; i++) {
            if (!args[i] || args[i].indexOf('-') === 0) {
                break;
            }
            commandArray.push(args[i]);
            optionArray.shift();
        }

        var optionMapping = this.parseOptions(optionArray);
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