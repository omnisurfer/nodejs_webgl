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
var assetLoaderCoordinatorPrevState = AssetLoaderCoordinatorState.INIT;

var displayStateOnce = true;
var displayStateLog = true;

// this variable likely subject to race conditions.
var advanceAssetLoaderCoordinatorState = false;

function assetLoaderCoordinatorStateMachine() {
    
    //console.log(arguments.callee.name);
    
    ++i;        
    switch(assetLoaderCoordinatorState) {
        case AssetLoaderCoordinatorState.INIT:
            stateMachineStateLog(AssetLoaderCoordinatorState.INIT);
            
            stateMachineAdvanceWait(AssetLoaderCoordinatorState.LOAD_MASTER_MANIFEST);            
            break;
            
        case AssetLoaderCoordinatorState.LOAD_MASTER_MANIFEST:            
            stateMachineStateLog(AssetLoaderCoordinatorState.LOAD_MASTER_MANIFEST);
            
            stateMachineAdvanceWait(AssetLoaderCoordinatorState.PARSE_MASTER_MANIFEST);
            break;
            
        case AssetLoaderCoordinatorState.PARSE_MASTER_MANIFEST:
            stateMachineStateLog(AssetLoaderCoordinatorState.PARSE_MASTER_MANIFEST);
            
            stateMachineAdvanceWait(AssetLoaderCoordinatorState.LOAD_ASSETS);
            break;
            
        case AssetLoaderCoordinatorState.LOAD_ASSETS:
            stateMachineStateLog(AssetLoaderCoordinatorState.LOAD_ASSETS);
            
            stateMachineAdvanceWait(AssetLoaderCoordinatorState.INIT);
            break;
                   
        case AssetLoaderCoordinatorState.ERROR:
        default:
            stateMachineStateLog(AssetLoaderCoordinatorState.ERROR);
            
            var stateReport = {
                "error":assetLoaderCoordinatorState
            };
            
            postMessage(stateReport);
            break;
    }        
    
    setTimeout("assetLoaderCoordinatorStateMachine()", 250);
};
assetLoaderCoordinatorStateMachine();

function stateMachineAdvanceWait(nextState) {
    
    //console.log(arguments.callee.name);
    
    // Check if receieved message to move onto next state
    if(advanceAssetLoaderCoordinatorState === true) {
        advanceAssetLoaderCoordinatorState = false;
        
        assetLoaderCoordinatorPrevState = assetLoaderCoordinatorState;
        assetLoaderCoordinatorState = nextState;
        
        var stateReport = {
            "ok":assetLoaderCoordinatorPrevState
        };
        postMessage(stateReport);
        
        displayStateOnce = true;
    }    
}

function stateMachineStateLog(message) {
    
    //console.log(arguments.callee.name);
    
    if(displayStateOnce === true && displayStateLog === true)
    {
        console.log(message);
        displayStateOnce = false;
    }
}

onmessage = function(e) {
    
    //console.log(arguments.callee.name);
    
    console.log("from main: " + e.data);
    
    if(e.data === "ADVANCE")
    {
        console.log("advancing state machine");
        advanceAssetLoaderCoordinatorState = true;
    }
};