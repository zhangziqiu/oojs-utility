var  testCase = [];
testCase.push({
    url: 'http://www.aaa.com/',
    protocol: 'http',
    host: 'www.aaa.com'
});

testCase.push({
    url: 'http://www.aaa.com/b.html',
    protocol: 'http',
    host: 'www.aaa.com',
    path: ['b.html']
});

testCase.push({
    url: 'http://www.aaa.com/b.html?c=1',
    protocol: 'http',
    host: 'www.aaa.com',
    path: ['b.html'],
    query: {
        c: '1'
    }
});

testCase.push({
    url: 'http://www.aaa.com/#ggg',
    protocol: 'http',
    host: 'www.aaa.com',
    anchor: 'ggg'
});

testCase.push({
    url: 'http://www.aaa.com:8080/b/c/d.html?e=1&f=2#ggg',
    protocol: 'http',
    host: 'www.aaa.com',
    port: '8080',
    path: ['b', 'c', 'd.html'],
    query: {
        e: '1',
        f: '2'
    },
    anchor: 'ggg'
});
module.exports = testCase;