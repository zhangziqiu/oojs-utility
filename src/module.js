require('node-oojs');
oojs.define({
    name: 'module',
    $module: function () {
        oojs.setPath({'oojs.utility':__dirname});
        oojs.setPath({'oojs.command':__dirname});
        oojs.setPath({'oojs.controller':__dirname});
    }
});