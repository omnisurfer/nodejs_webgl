/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// HelloCanvas.js

//https://stackoverflow.com/questions/45131804/how-to-set-a-time-uniform-in-webgl


var u_time = null;
var u_width = null;
var u_height = null;
var u_modelMatrix = null;
var u_sampler = null;

var a_position = 0.0;
var a_pointSize = null;
var a_color = null;
var a_texCoord = null;

// Look into creating a constructor function:
// https://hackernoon.com/prototypes-in-javascript-5bba2990e04bs

var displayAsset =
{
    'assetName':'testAsset',
    
    'sharedCanvas':{
        'u_width':800,
        'u_height':800
    },
    
    'shader':{
        'vertexSource':'shaders/ch5_vshader.vert',
        'fragmentSource':'shaders/ch5_fshader.frag',
      
        'vertexArray': new Float32Array([
        0.25, 0.0, 0.0,  0.0, 1.0,   1.0, 1.0, 1.0, 1.0,     10.0,
        0.6, 0.0, 0.0,  0.0, 0.0,   1.0, 1.0, 1.0, 1.0,     10.0,                
        0.2, 0.4, 0.0,  1.0, 1.0,   1.0, 1.0, 1.0, 1.0,     10.0,        
        0.6, 0.4, 0.0,  1.0, 0.0,   1.0, 1.0, 1.0, 1.0,     10.0  
        ]),
        
        'imageArray':[
            'images/snow.jpg'
        ],
        'textureArray':null,
        
        'uniforms':{
            'u_time':null,                
            'u_modelMatrix':null,
            'u_sampler':null
        },
    
        'attributes':{
            'a_position':null,
            'a_color':null,
            'a_pointSize':null,
            'a_texCoord':null
        }
    },     
    
    'animatation':
    {
        'kernelSource':null,
        'timeNow':null,
        'timeLast':null
    },
    
    'render':{
        'kernelSource':null,
        drawStuff() {
            console.log('render.drawStuff')
            /*
            var _modelMatrix = new Matrix4();

            _modelMatrix.setRotate(currentAngle, 0, 0, 1);                

            _modelMatrix.scale(2.0, 2.0, 2.0);

            _modelMatrix.translate(0, 0, 0);                      

            gl.uniformMatrix4fv(this.shader.uniforms.u_modelMatrix, false, _modelMatrix.elements);

            // gl.clearColor(0.0, 0.0, 0.0, 1.0);

            // gl.clear(gl.COLOR_BUFFER_BIT);

            if(mode === 1)
            {
                //console.log("mode 1");
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, numOfVertices);                 
            }
            else
            {
                //console.log("mode 2");
                gl.drawArrays(gl.TRIANGLES, 0, numOfVertices);                 
            }
            */
        }
    }
};

var image = null;
var texture = null;

var gl = null;

// Shader Variables
var VSHADER_SOURCE = null;
var FSHADER_SOURCE = null;

var fShaderLoaded = false;
var vShaderLoaded = false;
var imagesLoaded = false;

// Animation Translation Variables
//in degrees/s
var ANGLE_STEP = 58.0;
var currentAngle = 0.0;
var angleDeg = 0.0;

// Animate and Render Loop Timing Variables
//time when last frame was updated
var g_last = 0.0;
var renderLoopUpdateDebugLimit = 0;
var renderLoopUpdateCounter = 0;

// Click Event Variable
var g_points = [];

var display_once = false;

// <editor-fold defaultstate="collasped" desc="Load Resources">

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
        console.log('VSHADER_LOADED');        
    } else if (type === g1.FRAGMENT_SHADER)
    {
        FSHADER_SOURCE = fileString;
        console.log('FSHADER_LOADED');
    }   
}

function loadImageResources(gl, filename)
{
    console.log("loadImageResources");
    
    var request = new XMLHttpRequest();
    
    request.onreadystatechange =
            function () {
                if (request.readyState === 4 && request.status !== 404) {
                    onLoadImage(gl, filename);
                }
    };
    
    request.open('GET', filename, true);
    request.send();
}

function onLoadImage(g1, filename)
{
    console.log("onLoadImage");
    
    image.src = filename;
    
    console.log("image.src: " + image.src);    
}

function loadTexture(gl, texture, u_sampler, image)
{      
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    
    gl.activeTexture(gl.TEXTURE0);
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
            
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);    
   
    gl.uniform1i(u_sampler, 0);        
}

// </editor-fold>

// <editor-fold defaultstate="collasped" desc="Shader Composition">
function shaderSetup(gl)
{
    console.log('shaderSetup - edit@1040');

    var vshader = shaderCompile(gl, VSHADER_SOURCE, gl.VERTEX_SHADER);
    var fshader = shaderCompile(gl, FSHADER_SOURCE, gl.FRAGMENT_SHADER);

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
   
    // https://stackoverflow.com/questions/14413713/webgl-invalid-operation-uniform1i-location-not-for-current-program
    gl.useProgram(program);
    
    setupUniforms(gl, program);
    
    setupAttributes(gl, program);
 
    //init the time reference for first frame just befor calling animation loop
    g_last = Date.now();                
    
    window.requestAnimationFrame(renderLoop);
}

function setupUniforms(gl, program)
{
    console.log('setupUniforms');
    
     u_time = gl.getUniformLocation(program, "u_time");

    if (u_time < 0) {
        console.log('failed to get uniform time');
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
    
    // Bind stuff for images
    u_sampler = gl.getUniformLocation(program, "u_sampler");
    
    if (u_sampler < 0) {
        console.log('failed to get uniform u_sampler');
        return;
    }
}

function setupAttributes(gl, program)
{
    console.log('setupAtributes');
    
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
    
    a_texCoord = gl.getAttribLocation(program, "a_texCoord");
    
    if (a_texCoord < 0) {
        console.log('failed to get attribute a_texCoord');
        return;
    }      
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader
function shaderCompile(gl, sourceCode, type) {

    console.log('shaderCompile');

    var shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var info = gl.getShaderInfoLog(shader);
        throw 'Could not compile WebGL shader program. \n\n' + info;
    }
    return shader;
}
// </editor-fold>

// <editor-fold defaultstate="collasped" desc="Init Vertex Buffers">

function initVertexBuffers() {
    
    // console.log('initVertexBuffers');

    // Vertices, Interleaved
    // x, y, z,     s, t,   r, g, b, a,     p
    var verticesXYZsTrGBAp = new Float32Array([
        0.0, 0.577, 0.0,    0.0, 0.0,   1.0, 0.0, 0.0, 1.0,     10.0,
        -0.5, -0.288, 0.0,  0.0, 0.0,   0.0, 1.0, 0.0, 1.0,     20.0,
        0.5, -0.288, 0.0,   0.0, 0.0,   0.0, 0.0, 1.0, 1.0,     30.0,
        0.8, 0.0, 0.0,      0.0, 0.0,   1.0, 0.0, 0.0, 1.0,     25.0,
        0.8, 0.5, 0.0,      0.0, 0.0,   0.0, 1.0, 0.0, 1.0,     15.0,
        0.4, 0.5, 0.0,      0.0, 0.0,   0.0, 0.0, 1.0, 1.0,     50.0     
    ]);
    
    // number of vertices
    var n = 6;   
        
    var vertexSizeBuffer = gl.createBuffer();
    
    if(!vertexSizeBuffer) {
        console.log('Failed to create vertexBuffer object.');
        return -1;
    }
   
    // Array Buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);   
    
    var FSIZE = verticesXYZsTrGBAp.BYTES_PER_ELEMENT;
       
    gl.bufferData(gl.ARRAY_BUFFER, verticesXYZsTrGBAp, gl.DYNAMIC_DRAW);
    
    // Position
    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, FSIZE * 10, 0);
       
    gl.enableVertexAttribArray(a_position);
    
    // Color
    gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, FSIZE * 10, FSIZE * 5);
    
    gl.enableVertexAttribArray(a_color);
    
    // Point Size
    gl.vertexAttribPointer(
            a_pointSize, 1, gl.FLOAT, false, FSIZE * 10, FSIZE * 9);
    
    gl.enableVertexAttribArray(a_pointSize);
      
    // Texture Coord
    gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, FSIZE * 10, FSIZE * 3);
    
    gl.enableVertexAttribArray(a_texCoord);
    
    return n;
}

function initTextureVertexBuffers() {
            
    // console.log("initTextureVertexBuffers WIP");
    
    // Vertices, Interleaved
    // x, y, z,     s, t,   r, g, b, a,     p
    var verticesXYZsTrGBAp = new Float32Array([
        0.2, 0.0, 0.0,  0.0, 1.0,   1.0, 1.0, 1.0, 1.0,     10.0,
        0.6, 0.0, 0.0,  0.0, 0.0,   1.0, 1.0, 1.0, 1.0,     10.0,                
        0.2, 0.4, 0.0,  1.0, 1.0,   1.0, 1.0, 1.0, 1.0,     10.0,        
        0.6, 0.4, 0.0,  1.0, 0.0,   1.0, 1.0, 1.0, 1.0,     10.0  
    ]);
    
    // number of vertices
    var n = 4;       
    
    // Vertex Buffer
    var vertexSizeBuffer = gl.createBuffer();
    
    if(!vertexSizeBuffer) {
        console.log('Failed to create vertexBuffer object.');
        return -1;
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
    
    //Array Buffer
    var FSIZE = verticesXYZsTrGBAp.BYTES_PER_ELEMENT;
    
    gl.bufferData(gl.ARRAY_BUFFER, verticesXYZsTrGBAp, gl.DYNAMIC_DRAW);
    
    //Position
    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, FSIZE * 10, 0);
        
    gl.enableVertexAttribArray(a_position);
    
    //Color
    gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, FSIZE * 10, FSIZE * 5);
    
    gl.enableVertexAttribArray(a_color);
    
    //Point Size
    gl.vertexAttribPointer(
            a_pointSize, 1, gl.FLOAT, false, FSIZE * 10, FSIZE * 9);
    
    gl.enableVertexAttribArray(a_pointSize);
    
    //Texture Coord
    gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, FSIZE * 10, FSIZE * 3);
    
    gl.enableVertexAttribArray(a_texCoord);
      
    return n;
}

// </editor-fold>

// <editor-fold defaultstate="collasped" desc="Animate and Render">

function animate(angle)
{
    var now = Date.now();
    var elapsed = now - g_last; //ms
    g_last = now;
    
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    
    // console.log('FPS: ' + (1/elapsed) * 1000);
    
    return newAngle %= 360;
}

function drawTriangles(gl, numOfVertices, currentAngle, u_modelMatrix, mode)
{                
        var _modelMatrix = new Matrix4();
                                
        _modelMatrix.setRotate(currentAngle, 0, 0, 1);                
        
        _modelMatrix.scale(2.0, 2.0, 2.0);
        
        _modelMatrix.translate(0, 0, 0);                      
        
        gl.uniformMatrix4fv(u_modelMatrix, false, _modelMatrix.elements);
        
        // gl.clearColor(0.0, 0.0, 0.0, 1.0);
        
        // gl.clear(gl.COLOR_BUFFER_BIT);
        
        if(mode === 1)
        {
            //console.log("mode 1");
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, numOfVertices);                 
        }
        else
        {
            //console.log("mode 2");
            gl.drawArrays(gl.TRIANGLES, 0, numOfVertices);                 
        }
}

function clear(gl)
{
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
        
    gl.clear(gl.COLOR_BUFFER_BIT);
}

// https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
function renderLoop(timestamp) {

    if (renderLoopUpdateCounter > renderLoopUpdateDebugLimit)
    {
        // console.log('enter: renderLoop');        

        // gl.vertexAttrib1f(a_size, 10.0);

        // gl.uniform1f(u_time, timestamp / 1000.0);                              
        
        if(!display_once)
        {
            console.log('renderLoop (displays once)');
            
            gl.uniform1f(u_width, 800.0);
        
            gl.uniform1f(u_height, 800.0);
            
            loadTexture(gl, texture, u_sampler, image);
            
            display_once = true;
        }
        currentAngle = animate(currentAngle);
        
        clear(gl);                
        
        // init the vertices - init here for testing to see if I can combine render operations
        // looks like I can
        
        // REMEMBER, ONLY ONE ARRAY_BUFFER TO WORK WITH. NEED TO FIGURE OUT A WAY TO COMPOSITE WITH OVERWRITING IN MIND
        ///*
        var numOfVertices = initVertexBuffers();

        if (numOfVertices < 0){
            console.log('Failed to set the positions of the vertices');
            return;
        }
        
        // magic number, 1 = TRIANGLE_STRIP, anything else is TRIANGLES
        drawTriangles(gl, numOfVertices, currentAngle, u_modelMatrix, 0);
        //*/
              
        ///*
        var numOfTexVertices = initTextureVertexBuffers();
        
        if(!numOfTexVertices) {
            console.log('Failed to set the positions of the texture vertices');
        return -1;               
        }                                                  
                                           
        drawTriangles(gl, numOfTexVertices, currentAngle, u_modelMatrix, 1);
        //*/
        
        renderLoopUpdateCounter = 0;        
    }
    else
        renderLoopUpdateCounter++;
    
    window.requestAnimationFrame(renderLoop);
}

// </editor-fold>

// <editor-fold defaultstate="collasped" desc="Event Handlers">

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

function delayedCompile() {            
    console.log("Compiling...");
       
    for(i = 0; i < 100; ++i)
    {
        if(VSHADER_SOURCE && FSHADER_SOURCE)
        {        
            if(image)
            {
                shaderSetup(gl);                     
                break;
            }
            else
                console.log('no image!');
        }
    }          
}

setTimeout(delayedCompile, 5000);

// </editor-fold>

function main() {
    console.log('main');
           
    displayAsset.shader.imageArray.push('hello');
    
    displayAsset.render.drawStuff();
    
    console.log(displayAsset);        
    
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
    
    image = new Image();
        
    console.log("image: ");
    console.log(image);            
        
    texture = gl.createTexture();
    
    console.log("texture: ");
    console.log(texture);
    
    if (!texture) {
        console.log("failed to create texture");
        return false;
    }                
   
    // Load shaders from files
    loadShaderFile(gl, 'shaders/ch5_fshader.frag', gl.FRAGMENT_SHADER);
    loadShaderFile(gl, 'shaders/ch5_vshader.vert', gl.VERTEX_SHADER);        
    
    loadImageResources(gl, 'images/snow2.jpg');    
}