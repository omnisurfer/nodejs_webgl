/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// HelloCanvas.js

//https://stackoverflow.com/questions/45131804/how-to-set-a-time-uniform-in-webgl


var u_time = null;
var a_position = 0.0;
var a_pointSize = null;
var a_color = null;
var u_translation = null;
var u_cosB = null;
var u_sinB = null;

u_width = null;
u_height = null;

var Tx = 0.0, Ty = 0.0, Tz = 0.0;
var Sx = 0.0, Sy = 0.0, Sz = 0.0;
var angleDeg = 0.0;
var numOfVertices = 0;

//in degrees/s
var ANGLE_STEP = 58.0;
var currentAngle = 0.0;
//time when last frame was updated
var g_last = 0.0;

var u_modelMatrix = null;
var modelMatrix = null;

var renderLoopUpdateDebugLimit = 0;
var renderLoopUpdateCounter = 0;

var gl = null;

// Stores mouse presses
var g_points = [];

var VSHADER_SOURCE = null;
var FSHADER_SOURCE = null;

// <editor-fold defaultstate="collasped" desc="Shader Setup">

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
        shaderCompile(g1);
}

function shaderCompile(gl)
{
    console.log('shaderCompile');

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

    u_translation = gl.getUniformLocation(program, 'u_translation');
    
    if (u_translation < 0) {
        console.log('failed to get attribute u_translation');
        return;
    }
    
    u_cosB = gl.getUniformLocation(program, 'u_cosB');
    
    if (u_cosB < 0) {
        console.log('failed to get attribute u_cosB');
        return;
    }
    
    u_sinB = gl.getUniformLocation(program, 'u_sinB');
    
    if (u_sinB < 0) {
        console.log('failed to get attribute u_sinB');
        return;
    }

    a_position = gl.getAttribLocation(program, "a_position");

    if (a_position < 0) {
        console.log('failed to get attribute position');
        return;
    }
        
    a_pointSize = gl.getAttribLocation(program, "a_pointSize");

    if (a_pointSize < 0) {
        console.log('failed to get attribute a_pointSize');
        return;
    }
    
    a_color = gl.getAttribLocation(program, "a_color");
    
    if (a_color < 0) {
        console.log('failed to get attribute a_color');
        return;    
    }
   
    u_modelMatrix = gl.getUniformLocation(program, "u_modelMatrix");
    
    if (u_modelMatrix < 0) {
            console.log('failed to get attribute u_modelMatrix');
        return;
    }
    
    u_width = gl.getUniformLocation(program, "u_width");
    
    if (u_width < 0) {
            console.log('failed to get attribute u_width');
        return;
    }
    
    u_height = gl.getUniformLocation(program, "u_height");
    
    if (u_height < 0) {
            console.log('failed to get attribute u_height');
        return;
    }
    
    
    // init the vertices
    numOfVertices = initVertexBuffers();

    if (numOfVertices < 0){
        console.log('Failed to set the positions of the vertices');
        return;
    }
    
    //init the time reference for first frame just befor calling animation loop
    g_last = Date.now();
            
    window.requestAnimationFrame(renderLoop);
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader
function createShader(gl, sourceCode, type) {

    console.log('createShader');

    var shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var info = gl.getShaderInfoLog(shader);
        throw 'Could not compile WebGL shader program. \n\n' + info;
    }
    return shader;
}

function initVertexBuffers() {
    
    console.log('initVertexBuffers');

    // number of vertices
    var n = 6;       
    
    //create a buffer object to store the vertices
    var vertexSizeBuffer = gl.createBuffer();
    
    if(!vertexSizeBuffer) {
        console.log('Failed to create vertexBuffer object.');
        return -1;
    }
   
    //bind the buffer object to GL memory space
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
    
    // Interleaved
    // x, y, z, r, g, b, a, p
    var verticesColorsSizes = new Float32Array([
        0.0, 0.577,     1.0, 0.0, 0.0, 1.0,     10.0,
        -0.5, -0.288,   0.0, 1.0, 0.0, 1.0,     20.0,
        0.5, -0.288,    0.0, 0.0, 1.0, 1.0,     30.0,
        0.7, 0.577,     1.0, 0.0, 0.0, 1.0,     25.0,
        0.2, 0.288,     0.0, 1.0, 0.0, 1.0,     15.0,
        0.5, 0.288,     0.0, 0.0, 1.0, 1.0,     50.0
    ]);
    
    var FSIZE = verticesColorsSizes.BYTES_PER_ELEMENT;
    
    //write the data to the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, verticesColorsSizes, gl.STATIC_DRAW);
    
    // Assign the buffer object to a_position variable
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, FSIZE * 7, 0);
    
    // enable the assignment to a_position variable
    gl.enableVertexAttribArray(a_position);
    
    gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, FSIZE * 7, FSIZE * 2);
    
    gl.enableVertexAttribArray(a_color);
    
    gl.vertexAttribPointer(
            a_pointSize, 1, gl.FLOAT, false, FSIZE * 7, FSIZE * 6);
    
    gl.enableVertexAttribArray(a_pointSize);
      
    return n;
}

// <editor-fold>

// <editor-fold defaultstate="collasped" desc="Async Functions">

// https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
function renderLoop(timestamp) {

    if (renderLoopUpdateCounter > renderLoopUpdateDebugLimit)
    {
        // console.log('enter: renderLoop');        

        // gl.vertexAttrib1f(a_size, 10.0);

        // gl.uniform1f(u_time, timestamp / 1000.0);                              
        
        gl.uniform1f(u_width, 800.0);
        
        gl.uniform1f(u_height, 800.0);
        
        currentAngle = animate(currentAngle);
        
        draw(gl, numOfVertices, currentAngle, modelMatrix, u_modelMatrix);
        
        renderLoopUpdateCounter = 0;
    }
    else
        renderLoopUpdateCounter++;
    
    window.requestAnimationFrame(renderLoop);
}

function clickEvent(ev, gl, canvas, a_position) {

    console.log('clickEvent');

    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
            
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    console.log('x: ' + x);
    console.log('y: ' + y);
            
    console.log('rect.left: ' + rect.left);
    console.log('rect.top: ' + rect.top);

    g_points.push([x, y]);
}

function animate(angle)
{
    var now = Date.now();
    var elapsed = now - g_last; //ms
    g_last = now;
    
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    
    // console.log('FPS: ' + (1/elapsed) * 1000);
    
    return newAngle %= 360;
}

function draw(gl, numOfVertices, currentAngle, modelMatrix, u_modelMatrix)
{                
        modelMatrix.setRotate(currentAngle, 0, 0, 1);
        
        modelMatrix.translate(0, 0, 0);                      
        
        gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.elements);
        
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.drawArrays(gl.TRIANGLES, 0, numOfVertices);                 
}
// </editor-fold>

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
        clickEvent(ev, gl, canvas, a_position);
    };
    
    //init model matrix
    modelMatrix = new Matrix4();
    
    // Load shaders from files
    loadShaderFile(gl, 'shaders//ch5_fshader.frag', gl.FRAGMENT_SHADER);
    loadShaderFile(gl, 'shaders//ch5_vshader.vert', gl.VERTEX_SHADER);
}






