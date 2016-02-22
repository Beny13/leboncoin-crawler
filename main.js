var https = require('https');
var querystring = require('querystring');

var applicationKey = 'd2c84cdd525dddd7cbcc0d0a86609982c2c59e22eb01ee4202245b7b187f49f1546e5f027d48b8d130d9aa918b29e991c029f732f4f8930fc56dbea67c5118ce'

// Test de la connexion
var data = querystring.stringify({
    'app_id': 'leboncoin_android',
    'key': applicationKey,
    'action': 'login',
    'email': '---------------------------------------------------------------------------',
    'password': '---------------------------------------------------------------------------',
    'session_context': '00000000-6abd-bd5a-ffff-ffff99d603a9'
});

var options = {
    headers: {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
    },
    hostname: 'apimobile.leboncoin.fr',
    path: '/sm',
    method: 'POST'
};

var req = https.request(options, function(res) {
    console.log('Connexion OK!');
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        // console.log('BODY: ' + chunk);
    });

    getAdIds();
}).on("error", function(e){
    console.log("Got error: " + e.message);
})

req.write(data);
req.end();

// Récupère la front page de la zone d'ile de france
function getAdIds() {
    var data = querystring.stringify({key:applicationKey, 'app_id': 'leboncoin_android'});
    var options = {
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Content-Length': data.length
        },
        hostname: 'mobile.leboncoin.fr',
        path: '/templates/api/list.json?ca=12_s&w=1&f=a&o=1&q=&sp=0&pivot=0,0,0',
        method: 'POST'
    };

    var req = https.request(options, function(res) {
        console.log('Ads OK!');
        res.setEncoding('utf8');

        var data = [];
        res.on('data', function(chunk) {
            data += chunk;
        });

        res.on('end', function() {
            JSON.parse(data).ads.forEach(function(elem) {
                getPhoneNumber(elem.list_id);
            });
        });

        res.on("error", function(e) {
            console.log("Got error: " + e.message);
        });
    });

    req.write(data);
    req.end();

}

// Récupère un numéro de téléphone pour un id donné
function getPhoneNumber(listId) {
    var data = querystring.stringify({
        'app_id':'leboncoin_android',
        'key':applicationKey,
        'list_id':'928762845',
        'text':1,
    });

    var options = {
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Content-Length': data.length
        },
        hostname: 'api.leboncoin.fr',
        path: '/api/utils/phonenumber.json',
        method: 'POST'
    };

    var req = https.request(options, function(res) {
        console.log('Phone OK! id=' + listId);
        res.setEncoding('utf8');

        var data = [];
        res.on('data', function(chunk) {
            data += chunk;
        });

        res.on('end', function() {
            var utils = JSON.parse(data).utils;
            if (utils.status === 'OK')
                console.log(utils.phonenumber);
            else
                console.log("   Pas de numéro de téléphone");
        });
    });

    req.write(data);
    req.end();
}