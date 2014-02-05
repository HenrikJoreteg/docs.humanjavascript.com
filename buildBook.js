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
    var trimmed = fileName.slice(0, -3);
    return {
        name: trimmed,
        url: getUrlForFileName(trimmed)
    };
});

function sluggify(name) {
    return slugger(name).replace('---', '-');
}

function getUrlForFileName(fileName) {
    if (!fileName) return;
    return sluggify(fileName) + '.html';
}

function getAnchor(file) {
    if (!file) return;
    return '<a href="/book/' + file.url + '">' + file.name + '</a>';
}

async.forEach(files, function (file, cb) {
    var html = marked(fs.readFileSync(bookSrcDir + '/' + file.name + '.md', {encoding: 'utf8'}));
    var index = files.indexOf(file);
    var prevLink = getAnchor(files[index - 1]);
    var nextLink = getAnchor(files[index + 1]);
    var template = [
        'extends ../bookLayout',
        '',
        'block title',
        '  title Human JavaScript: ' + file.name
    ].join('\n');

    console.log(nextLink, prevLink);

    jade.render(template, {
        pretty: true,
        filename: buildDir + '/' + file.name + '.jade',
        nextLink: nextLink,
        prevLink: prevLink,
        chapters: files
    }, function (err, code) {
        if (err) throw err;
        fs.writeFileSync(buildDir + '/' + sluggify(file.name) + '.html', code.replace('<br>', html), {encoding: 'utf8'});
    });
});
