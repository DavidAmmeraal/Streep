var GeometryHelper = {
    createGeoFromJSON: function(json){
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
}

if(typeof define !== "undefined"){
    define(function(){
        return GeometryHelper;
    })
}