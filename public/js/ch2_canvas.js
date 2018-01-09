/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// HelloCanvas.js

//https://stackoverflow.com/questions/45131804/how-to-set-a-time-uniform-in-webgl


var u_time = null;
var a_position = 0.0;
var a_size = 10.0;

var counter_max = 250.0;
var counter = 0;

var gl = null;

// Stores mouse presses
var g_points = [];

var VSHADER_SOURCE = null;
var FSHADER_SOURCE = null;

// https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
function renderLoop(timestamp) {

    // console.log('enter: renderLoop');        

    gl.vertexAttrib3f(a_position, (counter / counter_max) * 1.0, 0.0, 0.0);

    gl.vertexAttrib1f(a_size, (counter / counter_max) * 100.0);

    gl.uniform1f(u_time, timestamp / 1000.0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.Points, 0, 1);

    // draw what has been clicked
    var len = g_points.length;

    for (var i = 0; i < len; i += 2) {
        
        var xy = g_points[i];
        
        gl.vertexAttrib3f(a_position, xy[0], xy[1], 0.0);

        gl.drawArrays(gl.Points, 0, 1);
    }

    // controls how fast the "animations" progress. Does not control frame rate.
    if (counter > counter_max)
        counter = 0;
    else
        counter++;

    window.requestAnimationFrame(renderLoop);
}

// <editor-fold defaultstate="collasped" desc="test">
// </editor-fold>

https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader
        function createShader(gl, sourceCode, type) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, sourceCode);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                var info = gl.getShaderInfoLog(shader);
                throw 'Could not compile WebGL shader program. \n\n' + info;
            }
            return shader;
        }

function loadShaderFile(g1, filename, shader) {
    console.log('loadShaderFile');

    var request = new XMLHttpRequest();

    request.onreadystatechange =
            function () {
                if (request.readyState === 4 && request.status !== 404) {
                    onLoadShader(g1, request.responseText, shader);
                }
            };

    request.open('GET', filename, true);
    request.send();
}

function onLoadShader(g1, fileString, type)
{
    console.log('onLoadShader');
    if (type === g1.VERTEX_SHADER)
    {
        VSHADER_SOURCE = fileString;
    } else if (type === g1.FRAGMENT_SHADER)
    {
        FSHADER_SOURCE = fileString;
    }

    if (VSHADER_SOURCE && FSHADER_SOURCE)
        start(g1);
}

function main() {
    console.log('main');
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    gl = getWebGLContext(canvas);

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    canvas.onmousedown = function (ev) {
        click(ev, gl, canvas, a_position);
    };

    // Load shaders from files
    loadShaderFile(gl, 'shaders//ch2_fshader.frag', gl.FRAGMENT_SHADER);
    loadShaderFile(gl, 'shaders//ch2_vshader.vert', gl.VERTEX_SHADER);
}

function start(gl)
{
    var vshader = createShader(gl, VSHADER_SOURCE, gl.VERTEX_SHADER);
    var fshader = createShader(gl, FSHADER_SOURCE, gl.FRAGMENT_SHADER);

    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createProgram

    var program = gl.createProgram();

    gl.attachShader(program, vshader);
    gl.attachShader(program, fshader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        var info = gl.getProgramInfoLog(program);
        throw 'Could not compile WebGL program. \n\n' + info;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to init shaders.');
        return;
    }

    // https://stackoverflow.com/questions/14413713/webgl-invalid-operation-uniform1i-location-not-for-current-program
    gl.useProgram(program);

    u_time = gl.getUniformLocation(program, "u_time");

    if (u_time < 0) {
        console.log('failed to get uniform time');
        return;
    }

    a_position = gl.getAttribLocation(program, "a_position");

    if (a_position < 0) {
        console.log('failed to get attribute position');
        return;
    }

    a_size = gl.getAttribLocation(program, "a_size");

    if (a_size < 0) {
        console.log('failed to get attribute size');
        return;
    }

    window.requestAnimationFrame(renderLoop);
}

function click(ev, gl, canvas, a_position) {

    console.log('click!');

    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    console.log('x: ' + x);

    g_points.push([x,y]);    

    /*
     gl.clear(gl.COLOR_BUFFER_BIT);
     
     gl.vertexAttrib1f(a_size, 10.0);
     
     var len = g_points.length;
     
     for(var i = 0; i < len; i +=2) {
     gl.vertexAttrib3f(a_position, g_points[i], g_points[i+1], 0.0);
     
     gl.drawArrays(gl.Points, 0, 1);
     } 
     */
}




