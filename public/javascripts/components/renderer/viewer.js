define(['../../util/webgl-test'], function(WebGLTest){
	var Viewer = function(target, context, options){
		var self = this;
        this.target = $(target);
		this.width = self.target.width();
		this.height = self.target.height();
		this.context = context;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(45, self.width / self.height, 0.1, 1000);
		// create a point light
		this.light = new THREE.PointLight(0xFFFFFF);
		this.components = [];
		this.distance = 200;
		this.startPosition = new THREE.Vector3(0, 0, this.distance);
		this.lookingAt = null;
        this.renderer = null;
        this.rotationUpTillNow = 0;
        this.sceneReady = false;
        this.backgroundColor = 0x363636;
        this.projector = new THREE.Projector();
        var currentHover = null;

        $.extend(this, options);

		var initialize = function(){
			self.renderer = getRenderer();
			self.positionCamera(self.startPosition);
			self.setBackgroundColor(self.backgroundColor);
			self.setSize(self.width, self.height);
			self.target.append(self.renderer.domElement);
			self.scene.add(self.light);
			$(self.context).on('changed', self.parseContext);
			self.parseContext();
			self.sceneReady = true;
			self.render();
            //listenToClicks();
            //listenToMouseMovement();
		};

        self.resize = function(){
            self.width = self.target.width();
            self.height = self.target.height();
            var aspect = self.width / self.height;
            self.camera.aspect = aspect;
            self.camera.updateProjectionMatrix();
            self.setSize(self.width, self.height);
            self.render()
        }

        var listenToMouseMovement = function(event){
            $(self.target).mousemove(function(event){
                event.preventDefault();
                var vector = new THREE.Vector3( ( event.clientX / self.target.width() ) * 2 - 1, - ( event.clientY / self.target.height() ) * 2 + 1, 0.5 );

                self.projector.unprojectVector( vector, self.camera );

                var raycaster = new THREE.Raycaster( self.camera.position, vector.sub( self.camera.position ).normalize() );
                var intersects = raycaster.intersectObjects( self.scene.children );

                if(intersects.length){
                    self.hover($(intersects[0].object).data('streep-component'))
                }else if(currentHover){
                    self.unhover(currentHover);
                }
            });
        }

        var listenToClicks = function(){
            $(self.target).on('click', function(event){
                event.preventDefault();

                var vector = new THREE.Vector3( ( event.clientX / self.target.width() ) * 2 - 1, - ( event.clientY / self.target.height() ) * 2 + 1, 0.5 );
                self.projector.unprojectVector( vector, self.camera );

                var raycaster = new THREE.Raycaster( self.camera.position, vector.sub( self.camera.position ).normalize() );

                console.time("RAYCASTING ON OBJECTS!");
                var intersects = raycaster.intersectObjects( self.scene.children );
                console.timeEnd("RAYCASTING ON OBJECTS!");
                intersects.length && self.focusTo($(intersects[0].object).data('streep-component'));
            });
        }
		
		var getRenderer = function(){
            console.log("Viewer.getRenderer()");
            console.log("Viewer: testing webgl support on browser!");
		   	if(WebGLTest.test()){
                console.log("Viewer.getRenderer(): browser has webgl!");
		   		return new THREE.WebGLRenderer({
		   			preserveDrawingBuffer: true ,
                    antialias: true
		   		});
		   	}else{
                console.log("Viewer.getRenderer(): browser does not have webgl!");
		   		return new THREE.CanvasRenderer();
		   	}
            console.log("finish Viewer.getRenderer()");
	   };
		
		self.getScene = function(){
			return self.scene;
		};
		
		self.positionLights = function(position){
			self.light.position.x = position.x;
			self.light.position.y = position.y;
			self.light.position.z = position.z;
		};
		
		self.positionCamera = function(position, duration){
            console.log("positionCamera(" + JSON.stringify(position) + "," + duration + ")");
			var curPosition = {};
			curPosition.x = self.camera.position.x;
			curPosition.y = self.camera.position.y;
			curPosition.z = self.camera.position.z;
			var newPosition = {};
			newPosition.x = position.x;
			newPosition.y = position.y;
			newPosition.z = position.z;

			var onComplete = function(){
				createjs.Ticker.removeEventListener("tick", tick);
			};
			
			var tick = function(){
				self.camera.position.x = curPosition.x;
				self.light.position.x = curPosition.x + 20;
				self.camera.position.y = curPosition.y;
				self.light.position.y = curPosition.y + 100;
				self.camera.position.z = curPosition.z;
				self.light.position.z = curPosition.z;

				if(self.sceneReady){
                    if(self.lookingAt.focusPerspective){
                        self.camera.lookAt(self.lookingAt.focusPerspective.lookAt)
                    }else if(self.lookingAt.mesh.position){
						self.camera.lookAt(self.lookingAt.mesh.position);
					}else{
						self.camera.lookAt({x: 0, y: 0, z: 0});
					}
					self.render();
				}
			};
			if(duration && WebGLTest.test()){
				createjs.Tween.get(curPosition).to(newPosition, duration).call(onComplete);
				createjs.Ticker.addEventListener("tick", tick);
			}else{
				curPosition = position;
				tick();
			}
		};
			
		self.rotate = function(x, duration){
			if(x > 0 || x < 0){
				self.rotationUpTillNow += x;
				var currentPosition = new THREE.Vector3(self.camera.position.x, self.camera.position.y, self.camera.position.z);
				currentPosition.x = Math.sin(self.rotationUpTillNow * Math.PI / 180) * self.distance;
				currentPosition.z = Math.cos(self.rotationUpTillNow * Math.PI / 180) * self.distance;
				self.positionCamera(currentPosition, 500);
			}
		};
		
		self.resetCamera = function(){
			rotationUpTillNow = 0;
			self.positionCamera(self.startPosition);
		};
		
		self.parseContext = function(){
			var components = self.context.get('components');
			for(var key in components){
				var comp = components[key];
				self.addComponent(comp);
			}
		};
		
		self.setBackgroundColor = function(color){
			self.backgroundColor = color;
            try{
			    self.renderer.setClearColor(color, 1);
            }catch(e){
                console.log(e);
            }
		};
		
		self.setSize = function(newWidth, newHeight){
			self.width = newWidth;
			self.height = newHeight;
			self.renderer.setSize(self.width, self.height);
		};
		
		self.addComponent = function(comp){
			if(!comp.loaded){
				$(comp).on('loaded', function(){
					self.addComponent(comp);
				});
				comp.load();
			}else{
				if(comp.mainFocus){
					self.focusTo(comp.mesh.position);
				}
				self.components.push(comp);
				var cmeshes = comp.getMesh();
				if(cmeshes instanceof THREE.Mesh){
					self.scene.add(cmeshes);
				}else{
					for(var key in cmeshes){
						var mesh = cmeshes[key];
						self.scene.add(mesh);
					}
				}
				listenToComponents();
				self.render();
			}
			
		};
		
		var listenToComponents = function(){
			for(var key in self.components){
				var comp = self.components[key];
				$(comp).off("request-focus").on("request-focus", function(event, requester){
					self.focusTo(requester);
				});
				$(comp).off("request-render").on("request-render", function(event, requester){
                    self.scene.remove(requester.mesh);
                    requester.redraw();
                    self.scene.add(requester.mesh);
                    self.render();
				});
                $(comp).off("request-removal").on("request-removal", function(event, requester){
                    self.scene.remove(requester.mesh);
                    delete requester;
                    self.render();
                });
			}
		};
		
		self.render = function(){
            self.renderer.render(self.scene, self.camera);
            $(self).trigger('viewer.render');
		};
		
		self.remove = function(comp){
			self.components.splice(self.components.indexOf(comp), 1);
			self.scene.remove(comp.mesh);
			self.render();
		};
		
		self.focusTo = function(comp, length){
            if(!length && length != 0){
                //length = 500;
            }
            if(self.lookingAt)
                self.lookingAt.focused = false;

            comp.focused = true
			self.lookingAt = comp;
			//self.resetCamera();
            console.log("LENGTH: " + length);
			if(comp.focusPerspective){
				self.positionCamera(comp.focusPerspective.cameraPosition, length);
			}
            $(self).trigger('viewer.focus', comp);
		};

        self.hover = function(comp){
            if(comp != currentHover){
                if(currentHover)
                    self.unhover(currentHover);

                currentHover = comp;
                comp.hover();
                self.render();
            }
        };

        self.unhover = function(comp){
            comp.unhover();
            currentHover = null;
            self.render();
        }
		
		initialize();
	};

	Viewer.prototype = {
        getScreenshot: function(){
            return this.renderer.domElement.toDataURL();
        },
        getComponents: function(){
            var findCompsIn = function(comp){
                var comps = [];
                for(var i = 0; i < comp.children.length; i++){
                    var child = comp.children[i];
                    if(child.children){
                        comps.push.apply(comps, findCompsIn(child));
                    }else{
                        comps.push(child);
                    }
                }
                return comps;
            }

            var comps = [];

            for(var i = 0; i < this.context.properties.components.length; i++){
                var comp = this.context.properties.components[i];
                if(comp.children){
                    comps.push.apply(comps, findCompsIn(comp));
                }else{
                    comps.push(comp);
                }

                /*

                if(comp.children){
                    comps.push.apply(comps, findCompsIn(comp));
                }else{
                    comps.push(comp);
                }*/
            }

            return comps;
        }
    };
	return Viewer;
});