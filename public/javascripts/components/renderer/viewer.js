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
		//this.light = new THREE.PointLight(0xFFFFFF);
        this.light = new THREE.DirectionalLight( 0xffffff, 1 );
		this.components = [];
		this.distance = 250;
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
		
		var getRenderer = function(){
		   	if(WebGLTest.test()){
		   		return new THREE.WebGLRenderer({
		   			preserveDrawingBuffer: true ,
                    antialias: true
		   		});
		   	}else{
		   		return new THREE.CanvasRenderer();
		   	}
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
                var x = parseInt(curPosition.x);
                var y = parseInt(curPosition.y);
                var z = parseInt(curPosition.z);
				self.camera.position.x = x;
				self.light.position.x = x + 20;
				self.camera.position.y = y;
				self.light.position.y = y + 100;
				self.camera.position.z = z;
				self.light.position.z = z;

				if(self.sceneReady){
                    if(self.lookingAt.focusPerspective){
                        self.camera.lookAt(self.lookingAt.focusPerspective.lookAt);
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
            self.rotationUpTillNow += x;

            var currentPosition = new THREE.Vector3(self.camera.position.x, self.camera.position.y, self.camera.position.z);
            currentPosition.x = Math.sin(self.rotationUpTillNow * Math.PI / 180) * self.distance;
            currentPosition.z = Math.cos(self.rotationUpTillNow * Math.PI / 180) * self.distance;

            self.positionCamera(currentPosition, 0);
		};
		
		self.resetCamera = function(){
			self.rotationUpTillNow = 0;
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
                    console.log("REQUEST REMOVAL OFF!");
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
            if(self.lookingAt)
                self.lookingAt.focused = false;

            comp.focused = true
			self.lookingAt = comp;
			//self.resetCamera();
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
        };

        self.getScreenshot = function(){
            return self.renderer.domElement.toDataURL();
        };

        self.destroy = function(){
            console.log("DESTROY()");
            self.scene = new THREE.Scene();
            self.scene.add(self.light);
        };

        self.get2DPositions = function(position){
            var pos = position.clone();
            var projScreenMat = new THREE.Matrix4();
            projScreenMat.multiplyMatrices( self.camera.projectionMatrix, self.camera.matrixWorldInverse );
            pos.applyProjection(projScreenMat);

            return { x: ( pos.x + 1 ) * self.target.width() / 2,
                y: ( - pos.y + 1) * self.target.height() / 2 };
        }

        self.getComponents = function(){
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

            for(var i = 0; i < self.context.properties.components.length; i++){
                var comp = self.context.properties.components[i];
                if(comp.children){
                    comps.push.apply(comps, findCompsIn(comp));
                }else{
                    comps.push(comp);
                }
            }

            return comps;
        }
		
		initialize();
	};
	return Viewer;
});