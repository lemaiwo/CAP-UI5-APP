// ***************************************************************************
// Copyright (c) 2017 SAP AG or an SAP affiliate company. All rights reserved.
// ***************************************************************************
// This sample code is provided AS IS, without warranty or liability of any kind.
//
// You may use, reproduce, modify and distribute this sample code without limitation,
// on the condition that you retain the foregoing copyright notice and disclaimer
// as to the original code.
// ***************************************************************************

// This example uses waterfall.
// npm install async-waterfall

'use strict';

var util = require('util');
var waterfall = require('async-waterfall');
var hana = require('@sap/hana-client');

var connOptions = {
    serverNode: 'myserver:30015',
    uid: 'system',
    pwd: 'manager'
};

var connection = hana.createConnection();

var tasks = [myconn,
    mycreatetable,
    mysql1, myexecute, myresults,
    mysql2, myexecute, myresults,
    mydisco];

waterfall(tasks, done);
console.log("Async calls underway\n");

function myconn(cb) {
    connection.connect(connOptions);
    cb(null);
}

function mycreatetable(cb) {
    var err = null;

    try {
        connection.exec("CREATE TABLE Employees(EmployeeID integer primary key, GivenName varchar(64), Surname varchar(64) )");
        connection.exec("INSERT INTO Employees VALUES(102, 'Fran',    'Whitney')");
        connection.exec("INSERT INTO Employees VALUES(105, 'Matthew', 'Cobb')");
        connection.exec("INSERT INTO Employees VALUES(129, 'Philip',  'Chin')");
        connection.exec("INSERT INTO Employees VALUES(207, 'Julie',   'Jordan')");
        connection.exec("INSERT INTO Employees VALUES(243, 'Robert',  'Breault')");
        connection.exec("INSERT INTO Employees VALUES(247, 'Melissa', 'Espinoza')");
    } catch (error) {
        console.log(error);
        console.log("");
    }

    cb(null);
}

function mysql1(cb) {
    var fields = ['EmployeeID', 'GivenName', 'Surname'];
    var range = [100, 199];
    var sql = util.format(
        'SELECT %s FROM Employees ' +
        'WHERE EmployeeID BETWEEN %s',
        fields.join(','), range.join(' AND '));
    console.log("SQL statement: " + sql);
    cb(null, sql);
}

function mysql2(cb) {
    var fields = ['EmployeeID', 'GivenName', 'Surname'];
    var range = [200, 299];
    var sql = util.format(
        'SELECT %s FROM Employees ' +
        'WHERE EmployeeID BETWEEN %s',
        fields.join(','), range.join(' AND '));
    console.log("SQL statement: " + sql);
    cb(null, sql);
}

function myexecute(sql, cb) {
    var rows = connection.exec(sql);
    cb(null, rows);
}

function myresults(rows, cb) {
    console.log(util.inspect(rows, { colors: true }));
    console.log("");
    cb(null);
}

function mydisco(cb) {
    connection.disconnect(cb);
}

function done(err) {
    console.log("Async done");
    if (err) {
        return console.error(err);
    }
}
