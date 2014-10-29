require('node-oojs');
define && define({
    name: 'module',
    $module: function () {
        oojs.setPath({'oojs.utility':__dirname});
    }
});