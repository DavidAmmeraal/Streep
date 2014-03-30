define(['./tab-page', 'text!./templates/engrave-page.html', '../renderer/component/modification/csg-text-modification'], function(TabPage, EngravePageTemplate, CSGTextModification){
    var EngravePage = function(options){
        var self = this;
        TabPage.apply(this, [options]);
    };

    EngravePage.prototype = Object.create(TabPage.prototype);
    EngravePage.prototype.id = "engrave";
    EngravePage.currentTarget = null;
    EngravePage.prototype.side = null;
    EngravePage.prototype.tabTitle = "Graveren";
    EngravePage.prototype.fonts = ['Helvetiker', 'Banana Brick', 'Fantasque', 'Gentilis'];
    EngravePage.prototype.sizes = ["S", "M", "L"];
    EngravePage.prototype.template = _.template(EngravePageTemplate);
    EngravePage.prototype.activate = function(){};
    EngravePage.prototype.setLeg = function(leg){
        var self = this;
        var listenToConnectors = function(){
            _.each(leg.connectors, function(connector){
                $(connector).on('selected', function(){
                    self.render.apply(self);
                });
            });
        }

        listenToConnectors(leg);
        this.leg = leg;

        if(this.leg.parent.currentLeftLeg == this.leg){
            this.side = "left";
        }else if(this.leg.parent.currentRightLeg == this.leg){
            this.side = "right";
        }
    };
    EngravePage.prototype.render = function(){
        var self = this;
        var display = this.leg.connectors[0];

        var html = $(this.template({fonts: this.fonts, sizes: this.sizes, display: display}));
        this.html = html;

        this.html.find('button.engrave').on('click', function(event){
            self.engraveClicked.apply(self, [event]);
        });
        this.html.find('button.carve').on('click', function(event){
            self.carveClicked.apply(self, [event]);
        });
        this.html.find('button.reset').on('click', function(event){
            self.resetClicked.apply(self, [event])
        });

        this.element.html(this.html);
    };
    EngravePage.prototype.resetClicked = function(event){
        var self = this;
        self.leg.connectors.map(function(connector){
            return connector.reset();
        });
        $(self).trigger('leg-reset', this.side);

    };
    EngravePage.prototype.engraveClicked = function(event){
        var self = this;

        var connector = this.leg.connectors[0];

        var mod = _.find(connector.modifications, function(mod){
            console.log(mod);
            return mod.setText && mod.action_name == "engrave";
        });

        this.loading(true);
        var size = this.element.find('select.size > :selected').val().toLowerCase();
        var text = this.element.find('input.text').val();
        var font = "helvetiker";
        var type = 'engrave';
        mod.setText(text, font, size);
        mod.execute().then(function(){
            $(self).trigger('engraving-applied', {'side': self.side, 'connector': connector.name, 'text': text, 'font': font, 'size': size, 'type': type});
            self.loading(false);
        });
        console.log("Engrave Clicked!");

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

        this.loading(true);
        var size = this.element.find('select.size > :selected').val().toLowerCase();
        var text = this.element.find('input.text').val();
        var font = "helvetiker";
        var type = 'carve';
        mod.setText(text, font, size);
        mod.execute().then(function(){
            $(self).trigger('engraving-applied', {'side': self.side, 'connector': connector.name, 'text': text, 'font': font, 'size': size, 'type': type});
            self.loading(false);
        });
        console.log("Carve Clicked!");
    }

    return EngravePage;
})