/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var i = 0;

function timedCount() {
    ++i;    
    console.log("from Worker: " + i);    
    postMessage('working...');
    setTimeout("timedCount()", 500);
};
timedCount();

onmessage = function(e) {
    console.log("message from main: " + e.data);
};