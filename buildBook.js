var fs = require('fs');
var marked = require('marked');
var jade = require('jade');
var async = require('async');
var slugger = require('slugger');
var marked = require('marked');
var rmrf = require('rimraf');
var bookSrcDir = __dirname + '/../human-javascript';
var buildDir = __dirname + '/book';
var files = fs.readdirSync(bookSrcDir);

// dump json folder
rmrf.sync(__dirname + '/json');
fs.mkdirSync(__dirname + '/json');

// remake build folder
rmrf.sync(buildDir);
fs.mkdirSync(buildDir);


files = files.filter(function (fileName) {
    return fileName.slice(0, 2) === 'ch';
}).map(function (fileName) {
    return fileName.slice(0, -3);
});

function sluggify(name) {
    return slugger(name).replace('---', '-');
}

function getUrlForFileName(fileName) {
    if (!fileName) return;
    return '<a href="/book/' + sluggify(fileName) + '.html">' + fileName + '</a>';
}

async.forEach(files, function (fileName, cb) {
    var html = marked(fs.readFileSync(bookSrcDir + '/' + fileName + '.md', {encoding: 'utf8'}));
    var index = files.indexOf(fileName);
    var prevLink = getUrlForFileName(index !== 0 && files[index - 1]);
    var nextLink = getUrlForFileName(files[index + 1]);
    var template = [
        'extends ../bookLayout',
        '',
        'block title',
        '  title Human JavaScript: ' + fileName
    ].join('\n');

    jade.render(template, {
        pretty: true,
        filename: buildDir + '/' + fileName + '.jade',
        nextLink: nextLink,
        prevLink: prevLink
    }, function (err, code) {
        if (err) throw err;
        fs.writeFileSync(buildDir + '/' + sluggify(fileName) + '.html', code.replace('<main>', '<main>' + html), {encoding: 'utf8'});
    });
});
