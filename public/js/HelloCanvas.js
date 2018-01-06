/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// HelloCanvas.js

//https://stackoverflow.com/questions/45131804/how-to-set-a-time-uniform-in-webgl


var uniform_time = null;
var a_position = null;
var a_size = null;

var gl = null;

var counter = 0;

var VSHADER_SOURCE_OLD = 
    `void main() {
        gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
        gl_PointSize = 50.0;
    }`;

var VSHADER_SOURCE = null;
var FSHADER_SOURCE = null;

var FSHADER_SOURCE_OLD = 
    `
    precision mediump float;

    uniform float u_time;

    const float PI = 3.14159265359;

    float freq_hz = 0.05, r = 1.0, b = 1.0, g = 1.0, a = 1.0;

    void main() {
        gl_FragColor = vec4(
            sin(u_time * freq_hz * PI) * r, 
            sin(u_time * freq_hz * PI + (3.0 * PI)/4.0) * b, 
            sin(u_time * freq_hz * PI + (5.0 * PI)/4.0) * g, 
            a
        );
    }`;

// https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
function renderLoop(timestamp){

    // console.log(timestamp);
            
    gl.vertexAttrib3f(a_position, (counter/10.0) * 1.0, 0.0, 0.0);
    
    gl.vertexAttrib1f(a_size, (counter/10.0) * 50.0);
    
    gl.uniform1f(uniform_time, timestamp/1000.0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.Points, 0, 1);
    
    if (counter > 10)
        counter = 0;
    else
        counter++;
    
    window.requestAnimationFrame(renderLoop);        
}

https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader
function createShader(gl, sourceCode, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
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
            if (request.readyState === 4 && request.status !== 404 ) {
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
    }
    else if (type === g1.FRAGMENT_SHADER)
    {
        FSHADER_SOURCE = fileString;        
    }
    
    if (VSHADER_SOURCE && FSHADER_SOURCE)
        start(g1);    
}

function main(){
    console.log('main');
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');        
        
    gl = getWebGLContext(canvas);
    
    if(!gl){
     console.log('Failed to get the rendering context for WebGL');
     return;
    }
    
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
                            
    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to init shaders.');
        return;
    }
            
    // https://stackoverflow.com/questions/14413713/webgl-invalid-operation-uniform1i-location-not-for-current-program
    gl.useProgram(program);
            
    uniform_time = gl.getUniformLocation(program, "u_time");
    
    if (uniform_time < 0){
        console.log('failed to get uniform time');
        return;
    }
    
    a_position = gl.getAttribLocation(program, "a_position");
    
    if (a_position < 0){
        console.log('failed to get attribute position');
        return;
    }
    
    a_size = gl.getAttribLocation(program, "a_size");
    
    if (a_size < 0){
        console.log('failed to get attribute size');
        return;
    }
    
    window.requestAnimationFrame(renderLoop);
}




