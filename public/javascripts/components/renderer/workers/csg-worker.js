var window = {};
importScripts('../util/geometry-helper.js', '../../../vendor/three/build/three.js', '../../../vendor/csg.js', '../../../vendor/ThreeBSP.js');
var ThreeBSP = window.ThreeBSP;
self.addEventListener('message', function(msg) {
    doOperation(msg.data.type, msg.data.targetGeo, msg.data.modGeo);
});

function doOperation(type, targetGeoJSON, modGeoJSON){
    var type = type;
    var geoObject = GeometryHelper.createGeoFromJSON(targetGeoJSON);
    var modGeoObject = GeometryHelper.createGeoFromJSON(modGeoJSON);
    var geoBSP = new ThreeBSP(geoObject);
    var modGeoBSP = new ThreeBSP(modGeoObject);
    var newGeo = geoBSP[type](modGeoBSP).toGeometry();
    self.postMessage(JSON.stringify(newGeo));
}

function createGeo(json){
    var vertices = json.vertices;
    var faces = json.faces;
    var faceVertexUvs = json.faceVertexUvs;

    var geo = new THREE.Geometry();
    for(var i = 0; i < vertices.length; i++){
        var vector = vertices[i];
        geo.vertices.push(new THREE.Vector3(vector.x, vector.y, vector.z));
    }

    for(var i = 0; i < faces.length; i++){
        var face = faces[i];
        var normal = new THREE.Vector3(face.normal.x, face.normal.y, face.normal.z);
        geo.faces.push(new THREE.Face3(face.a, face.b, face.c, normal));
    }

    for(var i = 0; i < faceVertexUvs.length; i++){
        var entry = faceVertexUvs[i];
        geo.faceVertexUvs[i] = [];
        for(var c = 0; c < entry.length; c++){
            var it = entry[c];
            geo.faceVertexUvs[i][c] = []
            for(var s = 0; s < it.length; s++){
                var vector = it[s];
                geo.faceVertexUvs[i][c].push(new THREE.Vector2(vector.x, vector.y));
            }
        }
    }

    return geo;
}