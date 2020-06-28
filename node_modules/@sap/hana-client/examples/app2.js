// ***************************************************************************
// Copyright (c) 2017 SAP AG or an SAP affiliate company. All rights reserved.
// ***************************************************************************
// This sample code is provided AS IS, without warranty or liability of any kind.
//
// You may use, reproduce, modify and distribute this sample code without limitation,
// on the condition that you retain the foregoing copyright notice and disclaimer
// as to the original code.
// ***************************************************************************

// This example uses async.

'use strict';

var async = require('async');
var hana = require('@sap/hana-client');
var hanaStream = require('../extension/Stream.js');

var connOptions = {
    serverNode: 'myserver:30015',
    uid: 'system',
    pwd: 'manager'
};

var conn = hana.createConnection();
conn.connect(connOptions);

try {
    conn.exec('drop table TEST_LOBS');
} catch (err) {
    // ignore the error
}

// Create test table
conn.exec('create table TEST_LOBS(ID integer primary key, DATA blob)');

// Insert rows
var stmt = conn.prepare('insert into TEST_LOBS valueS(?, ?)');
var buffer = null;
var ids = [1, 2, 3, 4, 5];

for (var i = 0; i < ids.length; i++) {
    buffer = new Buffer(new Array(1024 * 64 + ids[i]).join('ab'), "ascii");
    stmt.exec([ids[i], buffer]);
}

console.log('Fetch rows ......');

// Fetch rows using stream
async.eachOfLimit(ids, ids.length, function (id, i, cb) {
    var stmt = conn.prepare('select ID, DATA from TEST_LOBS where ID = ?');
    var rs = stmt.execQuery([id]);
    rs.next(function (err, ret) {
        if (err) {
            console.log(err);
        } else {
            var id = rs.getValue(0);
            var lob = [];
            var totalBytes = 0;
            var lobStream = hanaStream.createLobStream(rs, 1, { readSize: 6000 });

            lobStream.on('data', function (buffer) {
                if (buffer) {
                    totalBytes += buffer.length;
                }
            });
            lobStream.on('end', function () {
                console.log(id + ', total bytes --- ' + totalBytes);
            });
            lobStream.on('error', function (error) {
                console.log(error);
            });
        }
    });
});
