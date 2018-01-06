/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const express = require('express');
const app = express();

const appIP = '127.0.0.1', appPort = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => res.sendfile('index.html'));

app.listen(appPort, appIP, () => console.log('Express listening on ' + appIP + '@' + appPort));
