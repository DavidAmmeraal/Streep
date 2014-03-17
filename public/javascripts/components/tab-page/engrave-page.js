define(['./tab-page', 'text!./templates/engrave-page.html', '../renderer/component/modification/csg-text-modification'], function(TabPage, EngravePageTemplate, CSGTextModification){
    var EngravePage = function(options){
        var self = this;
        TabPage.apply(this, [options]);
    };

    EngravePage.prototype = Object.create(TabPage.prototype);
    EngravePage.prototype.id = "engrave";
    EngravePage.currentTarget = null;
    EngravePage.prototype.tabTitle = "Graveren";
    EngravePage.prototype.fonts = ['Helvetiker', 'Banana Brick', 'Fantasque', 'Gentilis'];
    EngravePage.prototype.sizes = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    EngravePage.prototype.template = _.template(EngravePageTemplate);
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
    };
    EngravePage.prototype.render = function(){
        var self = this;
        var display = _.find(this.leg.connectors, function(connector){
            return connector.selected;
        });

        var html = $(this.template({fonts: this.fonts, sizes: this.sizes, display: display}));
        this.html = html;

        this.html.find('button.engrave').on('click', function(event){
            self.engraveClicked.apply(self, [event]);
        });
        this.html.find('button.carve').on('click', function(event){
            self.carveClicked.apply(self, [event]);
        });
        this.html.find('button.reset').on('click', function(){
            _.invoke(self.leg.connectors, 'reset');
        });

        this.element.html(this.html);
    };
    EngravePage.prototype.engraveClicked = function(event){
        var connector = _.find(this.leg.connectors, function(connector){
            return connector.selected;
        });

        var mod = _.find(connector.modifications, function(mod){
            console.log(mod);
            return mod.setText && mod.action_name == "engrave";
        });

        var loading = this.element.find('.loading');
        loading.append('<div class="message">Bezig met graveren</div>');
        loading.show();
        var size = this.element.find('select.size > :selected').val();
        mod.setText(this.element.find('input.text').val(), "helvetiker", size);
        mod.execute().then(function(){
            loading.find('message').remove();
            loading.hide();
        });
        console.log("Carve Clicked!");
    };
    EngravePage.prototype.carveClicked = function(event){
        var connector = _.find(this.leg.connectors, function(connector){
            return connector.selected;
        });

        var mod = _.find(connector.modifications, function(mod){
            console.log(mod);
            return mod.setText && mod.action_name == "carve";
        });

        var loading = this.element.find('.loading');
        loading.show();
        var size = this.element.find('select.size > :selected').val();
        mod.setText(this.element.find('input.text').val(), "helvetiker", size);
        mod.execute().then(function(){
            loading.hide();
        });
        console.log("Carve Clicked!");
    }

    return EngravePage;
})