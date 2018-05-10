/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

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