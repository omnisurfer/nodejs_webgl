/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var i = 0

/* This is defined in two different places because the worker thread is not
 * capable of seeing variables defined in the main thread
 */
var AssetLoaderCoordinatorState = Object.freeze(
    {            
    "ERROR":"ERROR",
    "EXITED":"EXITED",
    "INIT":"INIT",
    "IDLE":"IDLE",
    "LOAD_MASTER_MANIFEST":"LOAD_MASTER_MANIFEST",
    "PARSE_MASTER_MANIFEST":"PARSE_MASTER_MANIFEST",
    "LOAD_ASSETS":"LOAD_ASSETS"
});
    
var AssetLoadState = Object.freeze({
    "ERROR":"ERROR",
    "EXITED":"EXITED",
    "INIT":"INIT",
    "IDLE":"IDLE",
    "LOAD_ASSET_MANIFESTS":"LOAD_ASSET_MANIFESTS",
    "PARSE_ASSET_IMAGES":"PARSE_ASSET_IMAGES",
    "PARSE_ASSET_ANIMATIONS":"PARSE_ASSET_ANIMATIONS",
    "PARSE_ASSET_RENDERS":"PARSE_ASSET_RENDERS",
    "PARSE_ASSET_SHADERS":"PARSE_ASSET_SHADERS",
    "PARSE_ASSET_VERTICES":"PARSE_ASSET_VERTICES"
});

var assetLoaderCoordinatorState = AssetLoaderCoordinatorState.INIT;
var advanceAssetLoaderCoordinatorState = false;

function assetLoaderCoordinatorStateMachine() {
    ++i;    
    console.log("worker running: " + i);
    switch(assetLoaderCoordinatorState)
    {
        case AssetLoaderCoordinatorState.INIT:
            console.log("INIT");
            
            if(advanceAssetLoaderCoordinatorState === true) {
                assetLoaderCoordinatorState = AssetLoaderCoordinatorState.LOAD_MASTER_MANIFEST;
                postMessage(AssetLoaderCoordinatorState.LOAD_MASTER_MANIFEST);
            }
            break;
            
        case AssetLoaderCoordinatorState.LOAD_MASTER_MANIFEST:
            console.log("LMM");
            break;
            
        default:
            console.log("INVALID STATE");
            assetLoaderCoordinatorState = AssetLoaderCoordinatorState.ERROR;
            break;
    }        
    
    setTimeout("assetLoaderCoordinatorStateMachine()", 250);
};
assetLoaderCoordinatorStateMachine();

onmessage = function(e) {
    console.log("from main: " + e.data);
    
    if(e.data === "ADVANCE")
    {
        console.log("RECEIVED ADVANCE MESSAGE");
        advanceAssetLoaderCoordinatorState = true;
    }
};