define(['./tab-page', 'text!./templates/engrave-page.html'], function(TabPage, EngravePageTemplate){
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


        this.html.find('button.engrave').on('click', function(){

        });
        this.html.find('button.carve').on('click', function(){

        });
        this.html.find('button.reset').on('click', function(){
            self.leg.reset(apply, self.leg);
        });
        this.

        this.element.html(this.html);
    };

    return EngravePage;
})