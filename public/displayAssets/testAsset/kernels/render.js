if(testAsset === undefined) {
    var testAsset = {};
}

testAsset.render = {

    kernel: function() {
            console.log('hello from testAsset render kernel!');    
    },
    
   drawTriangles_WIP: function(gl, numOfVertices, currentAngle, u_modelMatrix, mode)
    {                
            var _modelMatrix = new Matrix4();

            _modelMatrix.setRotate(currentAngle, 0, 0, 1);                

            _modelMatrix.scale(1.0, 1.0, 1.0);

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
};