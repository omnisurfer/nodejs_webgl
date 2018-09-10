/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// HelloCanvas.js

//https://stackoverflow.com/questions/45131804/how-to-set-a-time-uniform-in-webgl

var assetRoot = "displayAssets";    
var masterManifest = "masterManifest.json";

let assetLoader = new AssetLoader("loader", assetRoot, masterManifest);

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
    'namespace':'testAsset',
    
    //if blank, just use sharedCanvas??
    'sharedCanvas':'../sharedCanvas.json',
    
    'vertices':'shaders/vertices.json',
    
    'shaders':'shaders/shaders.json',             
    
    'images':'images/images.json',
            
    'animatation':
    {
        'kernelSource':'kernels/animation.js',
        'timeNow':null,
        'timeLast':null
    },
    
    'render':{
        'kernelSource':'kernels/render.js',
        drawStuff() {
            console.log('render.drawStuff stub function');
        }
    }
};

var image = null;
var texture = null;

var glContext = null;

// Shader Variables
var VSHADER_SOURCE = null;
var FSHADER_SOURCE = null;
var SCRIPT_LOAD = 0;

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

var worker_assetLoaderCoordinator;

// <editor-fold defaultstate="collasped" desc="Load Remote Resources">

function onLoadShader(glContext, fileString, type) {
    console.log(arguments.callee.name + '()');
    
    if (type === glContext.VERTEX_SHADER) {
        VSHADER_SOURCE = fileString;
        console.log('VSHADER_LOADED');        
    } else if (type === glContext.FRAGMENT_SHADER) {
        FSHADER_SOURCE = fileString;
        console.log('FSHADER_LOADED');
    }
    else
        console.log('Invaid Shader');
}

function onLoadScript(filename) {
    
    console.log(arguments.callee.name + '()');
    
    // https://stackoverflow.com/questions/950087/how-do-i-include-a-javascript-file-in-another-javascript-file
    var script = document.createElement("script");

    script.src = filename;

    document.head.appendChild(script);

    SCRIPT_LOAD += 1;    
}

function onLoadImage(filename) {
    console.log(arguments.callee.name + '()');
    
    image.src = filename;
    
    console.log("image.src: " + image.src);    
}

function loadRemoteResource(glContext, filename, resourceType, resource) {
    console.log(arguments.callee.name + '()');
    
    var request = new XMLHttpRequest();
    
    request.onreadystatechange =
        function () {
            if (request.readyState === 4 && request.status !== 404) {
                if(resourceType === 'shader')
                    onLoadShader(glContext, request.responseText, resource);
                else if(resourceType === 'script')
                    onLoadScript(filename);
                else if(resourceType === 'image')
                    onLoadImage(filename);
                else
                    console.log('Undefined resources');
            }
        };    
        
    request.open('GET', filename, true);
    request.send();
}

// </editor-fold>

// <editor-fold defaultstate="collasped" desc="Shader Composition">

// https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader
function compileGLShader(glContext, sourceCode, type) {
    console.log(arguments.callee.name + '()');

    var shader = glContext.createShader(type);
    glContext.shaderSource(shader, sourceCode);
    glContext.compileShader(shader);        

    if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
        var info = glContext.getShaderInfoLog(shader);
        throw 'Could not compile WebGL shader program. \n\n' + info;
    }
    return shader;
}

function createGLProgram(glContext, vertShader, fragShader) {
    
    console.log(arguments.callee.name + '()');
    
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createProgram

    var glProgram = glContext.createProgram();        
    
    glContext.attachShader(glProgram, vertShader);
    glContext.attachShader(glProgram, fragShader);

    glContext.linkProgram(glProgram);

    if (!glContext.getProgramParameter(glProgram, glContext.LINK_STATUS))
    {
        var info = glContext.getProgramInfoLog(glProgram);
        throw 'Could not compile WebGL program. \n\n' + info;
    }
   
    // https://stackoverflow.com/questions/14413713/webgl-invalid-operation-uniform1i-location-not-for-current-program
    glContext.useProgram(glProgram);
    
    return glProgram;
}

function setupGLUniforms(glContext, glProgram) {
    
    console.log(arguments.callee.name + '()');

     u_time = glContext.getUniformLocation(glProgram, "u_time");

    if (u_time < 0) {
        console.log('failed to get uniform time');
        return;
    }

    u_modelMatrix = glContext.getUniformLocation(glProgram, "u_modelMatrix");

    if (u_modelMatrix < 0) {
            console.log('failed to get attribute u_modelMatrix');
        return;
    }

    u_width = glContext.getUniformLocation(glProgram, "u_width");

    if (u_width < 0) {
            console.log('failed to get attribute u_width');
        return;
    }

    u_height = glContext.getUniformLocation(glProgram, "u_height");

    if (u_height < 0) {
            console.log('failed to get attribute u_height');
        return;
    }

    // Bind stuff for images
    u_sampler = glContext.getUniformLocation(glProgram, "u_sampler");

    if (u_sampler < 0) {
        console.log('failed to get uniform u_sampler');
        return;
    }
}

function setupGLAttributes(glContext, glProgram) {
    
    console.log(arguments.callee.name + '()');

    a_position = glContext.getAttribLocation(glProgram, "a_position");

    if (a_position < 0) {
        console.log('failed to get attribute position');
        return;
    }

    a_pointSize = glContext.getAttribLocation(glProgram, "a_pointSize");

    if (a_pointSize < 0) {
        console.log('failed to get attribute a_pointSize');
        return;
    }

    a_color = glContext.getAttribLocation(glProgram, "a_color");

    if (a_color < 0) {
        console.log('failed to get attribute a_color');
        return;    
    }

    a_texCoord = glContext.getAttribLocation(glProgram, "a_texCoord");

    if (a_texCoord < 0) {
        console.log('failed to get attribute a_texCoord');
        return;
    }      
}    

// TODO: Load images from loadGLTexture, see: 
// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
function loadGLTexture(glContext, image) {
    
    console.log(arguments.callee.name + '()');
    
    //texture test
    texture = glContext.createTexture();
    
    if (!texture) {
        console.log("failed to create texture");
        return false;
    } 
    
    glContext.pixelStorei(glContext.UNPACK_FLIP_Y_WEBGL, 1);
    
    glContext.activeTexture(glContext.TEXTURE0);
    
    glContext.bindTexture(glContext.TEXTURE_2D, texture);
            
    glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MIN_FILTER, glContext.LINEAR);
    
    glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGB, glContext.RGB, glContext.UNSIGNED_BYTE, image);    
   
    //u_sampler will draw from texture unit 0
    glContext.uniform1i(u_sampler, 0);       
}

// </editor-fold>

// <editor-fold defaultstate="collasped" desc="Animate and Render">

function initVertexBuffers() {
    
    // console.log(arguments.callee.name + '()');

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
        
    var vertexSizeBuffer = glContext.createBuffer();
    
    if(!vertexSizeBuffer) {
        console.log('Failed to create vertexBuffer object.');
        return -1;
    }
   
    // Array Buffer
    glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexSizeBuffer);   
    
    var FSIZE = verticesXYZsTrGBAp.BYTES_PER_ELEMENT;
       
    glContext.bufferData(glContext.ARRAY_BUFFER, verticesXYZsTrGBAp, glContext.DYNAMIC_DRAW);
    
    // Position
    glContext.vertexAttribPointer(a_position, 3, glContext.FLOAT, false, FSIZE * 10, 0);
       
    glContext.enableVertexAttribArray(a_position);
    
    // Color
    glContext.vertexAttribPointer(a_color, 4, glContext.FLOAT, false, FSIZE * 10, FSIZE * 5);
    
    glContext.enableVertexAttribArray(a_color);
    
    // Point Size
    glContext.vertexAttribPointer(
            a_pointSize, 1, glContext.FLOAT, false, FSIZE * 10, FSIZE * 9);
    
    glContext.enableVertexAttribArray(a_pointSize);
      
    // Texture Coord
    glContext.vertexAttribPointer(a_texCoord, 2, glContext.FLOAT, false, FSIZE * 10, FSIZE * 3);
    
    glContext.enableVertexAttribArray(a_texCoord);
    
    return n;
}

function initTextureVertexBuffers() {
            
    // console.log(arguments.callee.name + '()');
    
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
    var vertexSizeBuffer = glContext.createBuffer();
    
    if(!vertexSizeBuffer) {
        console.log('Failed to create vertexBuffer object.');
        return -1;
    }
    
    glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexSizeBuffer);
    
    //Array Buffer
    var FSIZE = verticesXYZsTrGBAp.BYTES_PER_ELEMENT;
    
    glContext.bufferData(glContext.ARRAY_BUFFER, verticesXYZsTrGBAp, glContext.DYNAMIC_DRAW);
    
    //Position
    glContext.vertexAttribPointer(a_position, 3, glContext.FLOAT, false, FSIZE * 10, 0);
        
    glContext.enableVertexAttribArray(a_position);
    
    //Color
    glContext.vertexAttribPointer(a_color, 4, glContext.FLOAT, false, FSIZE * 10, FSIZE * 5);
    
    glContext.enableVertexAttribArray(a_color);
    
    //Point Size
    glContext.vertexAttribPointer(
            a_pointSize, 1, glContext.FLOAT, false, FSIZE * 10, FSIZE * 9);
    
    glContext.enableVertexAttribArray(a_pointSize);
    
    //Texture Coord
    glContext.vertexAttribPointer(a_texCoord, 2, glContext.FLOAT, false, FSIZE * 10, FSIZE * 3);
    
    glContext.enableVertexAttribArray(a_texCoord);
      
    return n;
}

function animate(angle) {
    // console.log(arguments.callee.name + '()');
    
    var now = Date.now();
    var elapsed = now - g_last; //ms
    g_last = now;
    
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    
    // console.log('FPS: ' + (1/elapsed) * 1000);
    
    return newAngle %= 360;
}

function drawTriangles(glContext, numOfVertices, currentAngle, u_modelMatrix, mode) {
        //console.log(arguments.callee.name + '()');
        
        var _modelMatrix = new Matrix4();
                                
        _modelMatrix.setRotate(currentAngle, 0, 0, 1);                
        
        _modelMatrix.scale(2.0, 2.0, 2.0);
        
        _modelMatrix.translate(0, 0, 0);                      
        
        glContext.uniformMatrix4fv(u_modelMatrix, false, _modelMatrix.elements);
        
        // glContext.clearColor(0.0, 0.0, 0.0, 1.0);
        
        // glContext.clear(glContext.COLOR_BUFFER_BIT);
        
        if(mode === 1)
        {
            //console.log("mode 1");
            glContext.drawArrays(glContext.TRIANGLE_STRIP, 0, numOfVertices);                 
        }
        else
        {
            //console.log("mode 2");
            glContext.drawArrays(glContext.TRIANGLES, 0, numOfVertices);                 
        }
}

function clear(glContext) {
    // console.log(arguments.callee.name + '()');
    glContext.clearColor(0.0, 0.0, 0.0, 1.0);
        
    glContext.clear(glContext.COLOR_BUFFER_BIT);
}

// https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
function renderLoop(timestamp) {

    //console.log(arguments.callee.name + '()');
    
    if (renderLoopUpdateCounter > renderLoopUpdateDebugLimit)
    {
        // console.log('enter: renderLoop');        

        // glContext.vertexAttrib1f(a_size, 10.0);

        // glContext.uniform1f(u_time, timestamp / 1000.0);                              
        
        if(!display_once)
        {
            console.log(arguments.callee.name + '()');
            //console.log('renderLoop (displays once)');
            
            glContext.uniform1f(u_width, 800.0);
        
            glContext.uniform1f(u_height, 800.0);
            
            //loadTexture(glContext, texture, u_sampler, image);
            
            display_once = true;
        }
        currentAngle = animate(currentAngle);
        
        clear(glContext);                
        
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
        drawTriangles(glContext, numOfVertices, currentAngle, u_modelMatrix, 0);
        //*/
              
        ///*
        var numOfTexVertices = initTextureVertexBuffers();
        
        if(!numOfTexVertices) {
            console.log('Failed to set the positions of the texture vertices');
        return -1;               
        }                                                  
                                           
        drawTriangles(glContext, numOfTexVertices, currentAngle, u_modelMatrix, 1);
        //*/
        
        renderLoopUpdateCounter = 0;        
    }
    else
        renderLoopUpdateCounter++;
    
    window.requestAnimationFrame(renderLoop);
}

// </editor-fold>

// <editor-fold defaultstate="collasped" desc="Event Handlers">

function clickEvent(ev, glContext, canvas, a_position) {

    console.log(arguments.callee.name + '()');

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
    
    console.log(arguments.callee.name + '()');
       
    for(i = 0; i < 100; ++i) {        
        
        if(VSHADER_SOURCE && FSHADER_SOURCE && SCRIPT_LOAD > 1)
        {        
            if(image)
            {
                //gl compile path
                var compiledVertShader = compileGLShader(glContext, VSHADER_SOURCE, glContext.VERTEX_SHADER);
                
                var compiledFragShader = compileGLShader(glContext, FSHADER_SOURCE, glContext.FRAGMENT_SHADER);
                
                var compiledGLProgram = createGLProgram(glContext, compiledVertShader, compiledFragShader);               
                
                loadGLTexture(glContext, image);
                
                setupGLUniforms(glContext, compiledGLProgram);
                
                setupGLAttributes(glContext, compiledGLProgram);
                                                
                //init the time reference for first frame just befor calling animation loop
                g_last = Date.now();  
                
                window.requestAnimationFrame(renderLoop);
                
                // test code
                var assetNamespace = eval(displayAsset.namespace);
                
                assetNamespace.animation.kernel();
                
                assetNamespace.render.kernel();
                
                //assetLoader.queryDisplayAssets();
                
                // end test code
                
                break;
            }
            else
                console.log('no image!');
        }
    }          
}

console.log("Calling delayedCompile...1448");
setTimeout(delayedCompile, 5000);

// </editor-fold>

function main() {
    console.log(arguments.callee.name + '()');
    
    //startWorker();
           
    // <editor-fold defaultstate="collasped" desc="Test Code"> 
    
    console.log(AssetLoaderCoordinatorState.INIT);
    // look into web workers for loading files within a seperate state machine
    // https://medium.com/techtrument/multithreading-javascript-46156179cf9a
        
    assetLoader.queryDisplayAssets(queryDisplayAssetsCallback);
    
    var testArrayFloat32;
    
    var myData = null;
    
    /*
    $.getJSON(assetRoot + '\\' + displayAsset.namespace + '/shaders/vertices.json', function(data)
    {        
        console.log(data);

        $.each( data, function(key, val) {
            console.log(key);
            
            $.each(val, function(key, val) {
                console.log('\t' + key + ' : ' + val);
            });
            
            testArrayFloat32 = new Float32Array(val);
        });    
    });
    
    $.getJSON(assetRoot + '\\' + displayAsset.namespace + '/shaders/shaders.json', function(data)
    {
        console.log(data);
        
        $.each( data, function(key, val) {
            console.log(key);
            
            $.each(val, function(key, val) {
                console.log('\t' + key + ' : ' + val);
            });
            
            testArrayFloat32 = new Float32Array(val);
        });    
    });
    
    $.getJSON(assetRoot + '\\' + displayAsset.namespace + '/images/images.json', function(data)
    {
        console.log(data);
        
        $.each( data, function(key, val) {
            console.log(key);
            
            $.each(val, function(key, val) {
                console.log('\t' + key + ' : ' + val);
            });
            
            testArrayFloat32 = new Float32Array(val);
        });    
    });
    */
    //https://stackoverflow.com/questions/9463233/how-to-access-nested-json-data
    //https://stackoverflow.com/questions/17941127/get-value-of-key-from-a-nested-json     
    
    // </editor-fold>
    
    var canvas = document.getElementById('webgl');

    glContext = getWebGLContext(canvas);

    if (!glContext) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    canvas.onmousedown = function (ev) {
        clickEvent(ev, glContext, canvas, a_position);
    };
    
    //init model matrix
    modelMatrix = new Matrix4();
    
    image = new Image();                 
                      
    // look into using jquery instead?
    // https://api.jquery.com/jquery.getscript/
    loadRemoteResource(glContext,'shaders/ch5_fshader.frag', 'shader', glContext.FRAGMENT_SHADER);
    loadRemoteResource(glContext,'shaders/ch5_vshader.vert', 'shader', glContext.VERTEX_SHADER);
        
    loadRemoteResource(glContext, 'displayAssets/testAsset/kernels/animation.js', 'script', 'none');    
    loadRemoteResource(glContext, 'displayAssets/testAsset/kernels/render.js', 'script', 'none');                              
    
    loadRemoteResource(glContext, 'images/snow2.jpg', 'image', 'none');
}

//<editor-fold desc="Asset Loader Code WIP">
function queryDisplayAssetsCallback(assetList) {
    
    console.log(arguments.callee.name + '()');

    $.each( assetList, function(key, val) {
    console.log(key);

        $.each(val, function(key, val) {
            console.log('\t' + key + ' : ' + val);
        });                        
    });
}

function worker_startAssetLoaderCoordinator() {
    
    console.log(arguments.callee.name + '()');
    
    if(typeof(Worker) !== "undefined") {
        if(typeof(worker_assetLoaderCoordinator) === "undefined") {
            worker_assetLoaderCoordinator = new Worker("js/assetLoaderCoordinator.js"); 
            worker_assetLoaderCoordinator.postMessage("INIT");
        }

        worker_assetLoaderCoordinator.onmessage = function(e) {
            worker_processMesssageAssetLoaderCoordinator(e);
        };
    } else {
        console.log("browser does not support Web Workers");
    }
}

function worker_processMesssageAssetLoaderCoordinator(e) {
    
    console.log(arguments.callee.name + '()');
    
    var messageJSON = e.data;
    var message;
    var state;

    $.each(messageJSON, function(key, val) {                
        message = key;
        state = val;
    });

    // process the worker threads responses
    switch(message)
    {
        case "error":                    
            worker_stopAssetLoaderCoordinator();
            break;

        case "ok":
            break;

        default:
            break;
    }
    console.log("worker response: " + message + " " + state);            
}

function worker_stopAssetLoaderCoordinator() {
    
    console.log(arguments.callee.name + '()');
    
    if(worker_assetLoaderCoordinator !== undefined)
    {
        worker_assetLoaderCoordinator.terminate();
        worker_assetLoaderCoordinator = undefined;
    }
}

function worker_advanceStateMachineAssetLoaderCoordinator() {
    
    console.log(arguments.callee.name + '()');
    
    if(worker_assetLoaderCoordinator !== undefined)
    {
        worker_assetLoaderCoordinator.postMessage("ADVANCE");
    }
}
//</editor-fold>