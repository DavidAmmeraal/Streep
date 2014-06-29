define(['./tab-page', 'text!./templates/engrave-page.html', '../renderer/component/modification/csg-text-modification'], function(TabPage, EngravePageTemplate, CSGTextModification){
    var EngravePage = function(options){
        console.log("new EngravePage()");
        TabPage.apply(this, [options]);
    };

    EngravePage.prototype = Object.create(TabPage.prototype);
    EngravePage.prototype.id = "engrave";
    EngravePage.currentTarget = null;
    EngravePage.prototype.side = null;
    EngravePage.prototype.tabTitle = "Graveren";
    EngravePage.prototype.font = "";
    EngravePage.prototype.size = null;
    EngravePage.prototype.sizeMappings = {
        "s": "Klein",
        "m": "Groot"
    };
    EngravePage.prototype.fonts = [
        {
            'readable': "Lettertype 1",
            'name': "Blackout",
            'carve': true
        },
        {
            'readable': "Lettertype 2",
            'name': "Audiowide",
            'carve': false
        },
        {
            'readable': "Lettertype 3",
            'name': "HelveticaNeue",
            'carve': false
        },
        {
            'readable': "Lettertype 5",
            'name': "Rosewood",
            'carve': false
        }
    ];
    EngravePage.prototype.template = _.template(EngravePageTemplate);
    EngravePage.prototype.side = null;
    EngravePage.prototype.engraved = false;
    EngravePage.prototype.maxEngraveLength = 8;
    EngravePage.prototype.activate = function(){
    };
    EngravePage.prototype.render = function(){
        var self = this;

        var html = $(this.template({fonts: this.fonts, sizes: this.sizes, sizeMappings: this.sizeMappings}));
        this.html = html;

        var fontChooser = this.html.find('.font-chooser');
        var sizeChooser = this.html.find('.size-chooser');

        this.html.find('button.engrave').on('click', function(event){
            self.engraveClicked.apply(self, [event]);
        });
        this.html.find('button.carve').on('click', function(event){
            self.carveClicked.apply(self, [event]);
        });
        this.html.find('button.reset').on('click', function(event){
            self.resetClicked.apply(self, [event])
        });

        this.html.find('.dropdown-menu.font li').on('click', function(){
            self.font = $(this).find('a').data('font');

            var fontObj = _.find(self.fonts, function(font){
                return font.name == self.font;
            });

            console.log(fontObj);

            if(fontObj.carve){
                self.html.find('button.carve').show();
            }else{
                self.html.find('button.carve').hide()
            }
            var readable = $(this).find('a').text();
            fontChooser.html(readable + '<span class="caret"></span>');
        });

        this.html.find('.dropdown-menu.size li').on('click', function(){
            self.size = $(this).find('a').data('size');
            sizeChooser.html($(this).find('a').text() + '<span class="caret"></span>');
        });

        self.font = self.fonts[0].name;
        self.size = self.sizes[0];

        this.html.find('.text').on('keydown', function(event){
            var length = self.html.find('.text').val().length;
            if(length == self.maxEngraveLength && event.keyCode != 8){
                event.preventDefault();
            }
        });

        this.html.find('.text').on('keyup', function(event){
            var length = self.html.find('.text').val().length;
            self.html.find('.counter').text(8 - length);
        });
        this.element.html(this.html);
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

        var size = self.size.toLowerCase();
        var text = this.element.find('input.text').val();
        var font = self.font.toLowerCase();

        if(text.length > 0){
            this.loading(true);
            $(self).trigger('request-engraving', {'side': self.side, 'text': text, 'font': font, 'size': size});
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
    EngravePage.prototype.disable = function(msg){
        var loadingEl = this.element.find('.loading');
        loadingEl.find('.message').remove();
        loadingEl.addClass('no-img');
        if(msg){
            loadingEl.append('<div class="message">' + msg + '</div>');
        }else{
            loadingEl.append('<div class="message">Deze poot kan niet gegraveerd worden, kies de standaard poot om wel te kunnen graveren!</div>');
        }
        loadingEl.show();
        this.disableButtons();

    };
    EngravePage.prototype.enable = function(){
        var loadingEl = this.element.find('.loading');
        loadingEl.find('.message').remove();
        loadingEl.find('img').show();
        loadingEl.hide();
        this.element.find('.disabled').hide();
        this.enableButtons();
    };
    EngravePage.prototype.loading = function(loading){
        var loadingEl = this.element.find('.loading');
        loadingEl.removeClass('no-img');
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
    EngravePage.prototype.setEngraved = function(engraved){
        console.log("setEngraved(" + engraved + ")");
        var self = this;
        var disabledEl = this.html.find('.disabled');
        this.engraved = engraved;
        if(engraved){
            this.loading(false);
            disabledEl.html('');
            disabledEl.append('<div class="message">Deze poot is al gegraveerd.<br /><button class="reset">OPNIEUW GRAVEREN</button></div>');
            disabledEl.find('button.reset').on('click', function(){
                $(self).trigger('reset-requested', self.side);
            });
            disabledEl.show();
        }else{
            disabledEl.find('.message').remove();
            disabledEl.hide();
        }
    };
    EngravePage.prototype.carveClicked = function(event){
        var self = this;

        var size = self.size.toLowerCase();
        var text = this.element.find('input.text').val();
        var font = self.font.toLowerCase();

        if(text.length > 0){
            this.loading(true);
            $(self).trigger('request-carving', {'side': self.side, 'text': text, 'font': font, 'size': size});
        }
    }

    return EngravePage;
})