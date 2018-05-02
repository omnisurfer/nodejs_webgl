/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class AssetLoader {
    constructor(name, assetRoot, masterManifest) {
        this.name = name;
        this.assetRoot = assetRoot;
        this.masterManifest = masterManifest;
    };
    
    queryDisplayAssets(callback) {
        console.log('queryDisplayAssets_1733');
        $.getJSON(assetRoot + '\\' + masterManifest, function(assetList)
        {
           console.log('queryData: ' + assetList);
           if(callback) callback(assetList);
        });            
    }    
}

