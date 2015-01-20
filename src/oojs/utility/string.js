define && define({
    name: 'string',
    namespace: 'oojs.utility',
    templateRegex: null,
    $string: function () {
        this.templateRegex = new RegExp('{{([^}]*)}}', 'g');
    },
    template: function (source, data) {
        var result = source.replace(this.templateRegex, function (match, subMatch, index, s) {
            return data[subMatch] || "";
        });
        this.templateRegex.lastIndex = 0;
        return result;
    }
});