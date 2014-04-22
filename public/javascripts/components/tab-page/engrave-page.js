define(['./tab-page', 'text!./templates/engrave-page.html', '../renderer/component/modification/csg-text-modification'], function(TabPage, EngravePageTemplate, CSGTextModification){
    var EngravePage = function(options){
        console.log("new EngravePage()");
        var self = this;
        TabPage.apply(this, [options]);

    };

    EngravePage.prototype = Object.create(TabPage.prototype);
    EngravePage.prototype.id = "engrave";
    EngravePage.currentTarget = null;
    EngravePage.prototype.side = null;
    EngravePage.prototype.tabTitle = "Graveren";
    EngravePage.prototype.fonts = ['Helvetiker', 'Banana Brick', 'Fantasque', 'Gentilis'];
    EngravePage.prototype.template = _.template(EngravePageTemplate);
    EngravePage.prototype.activate = function(){};
    EngravePage.prototype.setLeg = function(leg){
        console.log("EngravePage.setLeg()");
        var self = this;

        var listenToConnectors = function(){
            _.each(leg.connectors, function(connector){
                $(connector).on('selected', function(){
                    self.render.apply(self);
                });
            });
        }

        this.leg = leg;

        if(this.leg.parent.currentLeftLeg == this.leg){
            this.side = "left";
        }else if(this.leg.parent.currentRightLeg == this.leg){
            this.side = "right";
        }

        if(leg.connectors.length > 0){
            listenToConnectors(leg);
        }

    };
    EngravePage.prototype.render = function(){
        console.log("EngravePage.prototype.render()");
        try{
            var self = this;
            var display = this.leg.connectors[0];
            var hasModifications = false;
            var modsApplied = false;

            if(display && display.modifications.length > 0){
                hasModifications = true;
                if(display.used){
                    modsApplied = true;
                }
            }

            if(hasModifications && !modsApplied){
                var sizes = _.keys(display.modifications[0].sizes);
                sizes = sizes.map(function(size){
                    return size.toUpperCase();
                });

                var html = $(this.template({fonts: this.fonts, sizes: sizes, display: display}));
                this.html = html;

                this.html.find('button.engrave').on('click', function(event){
                    self.engraveClicked.apply(self, [event]);
                });
                this.html.find('button.carve').on('click', function(event){
                    self.carveClicked.apply(self, [event]);
                });
                this.html.find('button.reset').on('click', function(event){
                    console.log("RESET CLICKED!!");
                    self.resetClicked.apply(self, [event])
                });

                this.html.find('.text').on('keydown', function(event){
                    var length = self.html.find('.text').val().length;
                    if(length == 12 && event.keyCode != 8){
                        event.preventDefault();
                    }
                });

                this.html.find('.text').on('keyup', function(event){
                    var length = self.html.find('.text').val().length;
                    self.html.find('.counter').text(length);
                });

                this.element.html(this.html);
            }else if(modsApplied){
                this.html = $(this.template({fonts: [], sizes: [], display: display}));
                this.element.html(this.html);
                this.disable();
                this.element.find('button.reset').removeAttr('disabled');
                this.element.find('button.reset').on('click', function(event){
                    self.resetClicked.apply(self, [event])
                });
                this.element.find('button.reset').css('z-index', 9999);
            }else{
                this.html = $(this.template({fonts: [], sizes: [], display: display}));
                this.element.html(this.html);
                this.element.find('button.reset').css('z-index', '');
                this.disable();
            }
        }catch(err){
            console.log(err);
        }

    };
    EngravePage.prototype.resetClicked = function(event){
        var self = this;
        self.leg.connectors.map(function(connector){
            return connector.reset();
        });
        $(self).trigger('leg-reset', this.side);
        self.render();
    };
    EngravePage.prototype.engraveClicked = function(event){
        var self = this;

        var connector = this.leg.connectors[0];

        var mod = _.find(connector.modifications, function(mod){
            console.log(mod);
            return mod.setText && mod.action_name == "engrave";
        });

        var size = this.element.find('select.size > :selected').val().toLowerCase();
        var text = this.element.find('input.text').val();
        var font = "helvetiker";
        var type = 'engrave';

        if(text.length > 0){
            this.loading(true);

            mod.setText(text, font, size);
            mod.applied = true;
            mod.execute().then(function(){
                $(self).trigger('engraving-applied', {'side': self.side, 'connector': connector.name, 'text': text, 'font': font, 'size': size, 'type': type});
                self.render();
            });
            console.log("Engrave Clicked!");
        }

    };
    EngravePage.prototype.enableButtons = function(){
        this.html.find('button.engrave').removeAttr('disabled');
        this.html.find('button.carve').removeAttr('disabled');
        this.html.find('button.reset').removeAttr('disabled');
    };
    EngravePage.prototype.disableButtons = function(){
        this.html.find('button.engrave').attr('disabled', 'disabled');
        this.html.find('button.carve').attr('disabled', 'disabled');
        this.html.find('button.reset').attr('disabled', 'disabled');
    };
    EngravePage.prototype.disable = function(){
        var loadingEl = this.element.find('.loading');
        loadingEl.append('<div class="message">Deze poot kan niet gegraveerd worden!</div>');
        loadingEl.find('img').hide();
        loadingEl.show();
        this.disableButtons();

    };
    EngravePage.prototype.enable = function(){
        var loadingEl = this.element.find('.loading');
        loadingEl.find('.message').remove();
        loadingEl.find('img').show();
        loadingEl.hide();
        this.enableButtons();
    };
    EngravePage.prototype.loading = function(loading){
        var loadingEl = this.element.find('.loading');
        if(loading){
            loadingEl.append('<div class="message">Bezig met graveren</div>');
            loadingEl.show();
            this.disableButtons();
        }else{
            loadingEl.find('.message').remove();
            loadingEl.hide();
            this.enableButtons();
        }
    };
    EngravePage.prototype.carveClicked = function(event){
        var self = this;

        var connector = this.leg.connectors[0];

        var mod = _.find(connector.modifications, function(mod){
            console.log(mod);
            return mod.setText && mod.action_name == "carve";
        });

        var size = this.element.find('select.size > :selected').val().toLowerCase();
        var text = this.element.find('input.text').val();
        var font = "helvetiker";
        var type = 'carve';

        if(text.length > 0){
            this.loading(true);

            mod.setText(text, font, size);
            mod.applied = true;
            mod.execute().then(function(){
                $(self).trigger('engraving-applied', {'side': self.side, 'connector': connector.name, 'text': text, 'font': font, 'size': size, 'type': type});
                self.render();
            });
            console.log("Carve Clicked!");
        }
    }

    return EngravePage;
})