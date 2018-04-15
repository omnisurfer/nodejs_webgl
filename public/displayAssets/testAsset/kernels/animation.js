if(testAsset === undefined) {
    var testAsset = {};
}

testAsset.animation = {

    kernel: function() {
            console.log('hello from animation kernel!?');    
    },
    
    animate_WIP: function(angle, g_last, ANGLE_STEP)
    {
        var now = Date.now();
        var elapsed = now - g_last; //ms
        g_last = now;

        var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;

        // console.log('FPS: ' + (1/elapsed) * 1000);

        return newAngle %= 360;
    }
};