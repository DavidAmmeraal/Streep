define(['./tab-page', 'text!./templates/engrave-page.html', '../renderer/component/modification/csg-text-modification'], function(TabPage, EngravePageTemplate, CSGTextModification){
    var EngravePage = function(options){
        var self = this;
        TabPage.apply(this, [options]);

        var initialize = function(){
            listenToConnectors();
        };

        var listenToConnectors = function(){
            _.each(self.leg.connectors, function(connector){
                $(connector).on('selected', function(){
                    self.render.apply(self);
                });
            });
        }

        initialize();
    };

    EngravePage.prototype = Object.create(TabPage.prototype);
    EngravePage.prototype.id = "engrave";
    EngravePage.currentTarget = null;
    EngravePage.prototype.tabTitle = "Graveren";
    EngravePage.prototype.fonts = ['Helvetiker', 'Banana Brick', 'Fantasque', 'Gentilis'];
    EngravePage.prototype.sizes = [7, 8, 9, 10];
    EngravePage.prototype.template = _.template(EngravePageTemplate);
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
        this.html.find('button.carve').on('click', function(){
            self.carveClicked.apply(self, [event]);
        });
        this.html.find('button.reset').on('click', function(){
            self.leg.reset.apply(self);
        });

        this.element.html(this.html);
    };
    EngravePage.prototype.engraveClicked = function(event){
        var connector = _.find(this.leg.connectors, function(connector){
            return connector.selected;
        });
        console.log(connector);
        console.log("Engrave Clicked!");
    };
    EngravePage.prototype.carveClicked = function(event){
        var connector = _.find(this.leg.connectors, function(connector){
            return connector.selected;
        });
        var mod = _.find(connector.modifications, function(mod){
            return mod.setText;
        });
        mod.setText("TEST", "helvetiker", 8);
        mod.execute().then(function(){
            console.log("MODIFICATION EXECUTED!");
        });
        console.log("Carve Clicked!");
    }

    return EngravePage;
})