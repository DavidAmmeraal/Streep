var mongoose = require('mongoose');
var Connector = require('../models/connector');
var Modification = require('../models/modification');
var CSGObjectModification = require('../models/csg-object-modification');
var CSGTextModification = require('../models/csg-text-modification');
var CSGObject = require('../models/csg-object');
var Transformation = require('../models/transformation');
var Rotate = require('../models/rotate');
var Translate = require('../models/translate');
var JSONComponent = require('../models/json-component');
var Composition = require('../models/frame');

var voorkantSpot = new Connector({
    name: 'neusbrug',
    modifications: [],
    position: {
        x: -3,
        y: 15,
        z: 0
    }
});

var voorkant = new JSONComponent({
    name: 'voorkant',
    src: '3dmodels/voorkant_fullscale.js',
    positioning: {},
    focusPosition: {
        x: 0,
        y: 0,
        z: 200
    },
    connectors: [
        voorkantSpot
    ],
    material: "MeshLambertMaterial"
});

var pootLinksEngraveObjectMod = new CSGObjectModification({
    type: 'subtract',
    readable: 'Engrave Object',
    objects:[
        new CSGObject({
            name: 'star',
            readable: 'Start',
            src: '3dmodels/ster.js',
            transformations: [
                new Transformation({
                    type: 'Rotate',
                    implementation: new Rotate({axis: 'z', amount: 90})
                })
            ]
        })
    ]
});

var pootLinksEngraveTextMod = new CSGTextModification({
    name: 'poot links engrave text modification',
    type: 'subtract',
    readable: 'Engrave Text',
    transformations: [
        new Transformation({
            type: 'Rotate',
            implementation: new Rotate({axis: 'z', amount: -7})
        }),
        new Transformation({
            type: 'Rotate',
            implementation: new Rotate({axis: 'y', amount: 90})
        }),
        new Transformation({
            type: 'Translate',
            implementation: new Translate({x: 71, y: 7, z: -35})
        })
    ],
    depth: 4
});

var pootLinksAddTextMod = new CSGTextModification({
    name: 'poot links add text modification',
    type: 'union',
    readable: 'Add Text',
    transformations: [
        new Transformation({
            type: 'Rotate',
            implementation: new Rotate({axis: 'z', amount: -7})
        }),
        new Transformation({
            type: 'Rotate',
            implementation: new Rotate({axis: 'y', amount: 90})
        }),
        new Transformation({
            type: 'Translate',
            implementation: new Translate({x: 71, y: 7, z: -35})
        })
    ],
    depth: 4
});

var pootLinksCarveTextMod = new CSGTextModification({
    type: 'subtract',
    readable: 'Carve Text',
    transformations:[
        new Transformation({
            type: 'Rotate',
            implementation: new Rotate({axis: 'z', amount: -7})
        }),
        new Transformation({
            type: 'Rotate',
            implementation: new Rotate({axis: 'y', amount: 90})
        }),
        new Transformation({
            type: 'Translate',
            implementation: new Translate({x: 68, y: 7, z: -35})
        })
    ],
    depth: 10
});

var pootLinksSpot = new Connector({
   name: 'near_voorkant',
   modifications: [
       new Modification({
           type: 'CSGObjectModification',
           implementation: pootLinksEngraveObjectMod
       }),
       new Modification({
           type: 'CSGTextModification',
           implementation: pootLinksEngraveTextMod
       }),
       new Modification({
           type: 'CSGTextModification',
           implementation: pootLinksCarveTextMod
       }),
       new Modification({
           type: 'CSGTextModification',
           implementation: pootLinksAddTextMod
       })
   ],
   position: {
       x: 72,
       y: 13,
       z: -45
   }
});

var pootLinks = new JSONComponent({
    name: 'poot_links',
    src: '3dmodels/poot_links_fullscale.js',
    positioning: {},
    focusPosition: {
        x: 250,
        y: 0,
        z: -100
    },
    connectors: [
        pootLinksSpot
    ],
    material: "MeshLambertMaterial"
});

//Create pootrechts
var pootRechtsEngraveTextMod = new CSGTextModification({
    type: 'subtract',
    readable: 'Engrave Text',
    transformations:[
        new Transformation({
            type: 'Rotate',
            implementation: new Rotate({axis: 'z', amount: 7})
        }),
        new Transformation({
            type: 'Rotate',
            implementation: new Rotate({axis: 'y', amount: -90})
        }),
        new Transformation({
            type: 'Translate',
            implementation: new Translate({x: -72, y: 6, z: -55})
        })
    ],
    depth: 4
});

//Create pootrechts
var pootRechtsAddTextMod = new CSGTextModification({
    type: 'union',
    readable: 'Add Text',
    transformations:[
        new Transformation({
            type: 'Rotate',
            implementation: new Rotate({axis: 'z', amount: 7})
        }),
        new Transformation({
            type: 'Rotate',
            implementation: new Rotate({axis: 'y', amount: -90})
        }),
        new Transformation({
            type: 'Translate',
            implementation: new Translate({x: -74, y: 6, z: -55})
        })
    ],
    depth: 4
});

var pootRechtsCarveTextMod = new CSGTextModification({
    type: 'subtract',
    readable: 'Carve Text',
    transformations:[
        new Transformation({
            type: 'Rotate',
            implementation: new Rotate({axis: 'z', amount: 7})
        }),
        new Transformation({
            type: 'Rotate',
            implementation: new Rotate({axis: 'y', amount: -90}),
        }),
        new Transformation({
            type: 'Translate',
            implementation: new Translate({x: -69, y: 6, z: -55})
        })
    ],
    depth: 10
});

var pootRechtsEngraveObjectMod = new CSGObjectModification({
    type: 'subtract',
    readable: 'Engrave Object',
    objects: [
        new CSGObject({
            name: 'shark',
            readable: 'Shark',
            src: '3dmodels/shark.js',
            transformations: [
                new Transformation({
                    type: 'Rotate',
                    implementation: new Rotate({axis: 'x', amount: 90})
                }),
                new Transformation({
                    type: 'Rotate',
                    implementation: new Rotate({axis: 'y', amount: 90})
                }),
                new Transformation({
                    type: 'Translate',
                    implementation: new Translate({x: -74, y: 11, z: -48})
                })
            ]
        }),
        new CSGObject({
            name: 'star',
            readable: 'Star',
            src: '3dmodels/ster.js',
            transformations: [
                new Transformation({
                    type: 'Rotate',
                    implementation: new Rotate({axis: 'z', amount: 90})
                }),
                new Transformation({
                    type: 'Rotate',
                    implementation: new Rotate({axis: 'y', amount: 0})
                }),
                new Transformation({
                    type: 'Translate',
                    implementation: new Translate({x: -72, y: 9, z: -48})
                })
            ]
        })
    ]
});

var pootRechtsSpot = new Connector({
    name: 'near_voorkant',
    modifications: [
        new Modification({
            type: 'CSGTextModification',
            implementation: pootRechtsEngraveTextMod
        }),
        new Modification({
            type: 'CSGTextModification',
            implementation: pootRechtsCarveTextMod
        }),
        new Modification({
            type: 'CSGObjectModification',
            implementation: pootRechtsEngraveObjectMod
        }),
        new Modification({
            type: 'CSGTextModification',
            implementation: pootRechtsAddTextMod
        })
    ],
    position: {
        x: -71,
        y: 13,
        z: -45
    }
});
var pootRechts = new JSONComponent({
    name: 'poot_rechts',
    src: '3dmodels/poot_rechts_fullscale.js',
    positioning: {},
    focusPosition: {
        x: -250,
        y: 0,
        z: -100
    },
    connectors: [
        pootRechtsSpot
    ],
    material: "MeshLambertMaterial"
});

//END create pootrechts

//Create bril
var bril = new Composition({
    name: 'bril',
    focusPosition:{
        x: 0,
        y: 0,
        z: 400
    },
    children: [voorkant, pootLinks, pootRechts]
});

module.exports = {
    start: function(){
        bril.save(function(err){
            if(err){
                console.log(err);
            }else{
                console.log("Saved");
            }
        });
    }
}

/*
var pootLinksSpot = new Connector({
    name: 'near_voorkant',
    modifications: [
        new Modification({
            type: 'CSGObjectModification',
            implementation: pootLinksEngraveObjectMod
        })
    ],
    position: {
        x: 72,
        y: 13,
        z: -45
    }
});*/

/*
var carveMod = new Modification({
    type: 'subtract',
    readable: 'Carve Text',
    transformations: [
        {
            class: 'Rotate',
            axis: 'z',
            amount: 7
        }
    ],
    depth: 10
});

carveMod.save(function (err) {
    if (err) return handleError(err);
    console.log("carveMod saved!");
})
*/


