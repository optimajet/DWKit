function TitleLayout() {
    var layout = Ext.create('Ext.panel.Panel', {
        id : "titleLayout"
    });
    this.setTitle = function (text) {
        layout.update(text);
    }

    this.getControl = function () {
        return layout;
    }

    this.setSize = function (width, height) {
        layout.setSize(width, height);
    }
}

function Slider(stepsCount) {
    var sliderControl = Ext.create('Ext.slider.Single', {
        width: 200,
        value: 0,
        hidden: true,
        minValue: 0,
        maxValue: 100,
        useTips: false,
        readOnly:true
    });
    sliderControl.increment = (sliderControl.maxValue - sliderControl.minValue) / (stepsCount - 1);
    this.setVisible = function() {
        sliderControl.show();
    }

    var navigate = function (text, direction) {
        sliderControl.setValue(sliderControl.getValue() + direction * sliderControl.increment);
    }

    this.next = function (text) {
        navigate(text, 1);
    }

    this.prev = function (text) {
        navigate(text, -1);
    }

    this.getControl = function () {
        return sliderControl;
    }

    this.setSize = function (width, height) {
        sliderControl.setSize(width, height);
    }

}
function Wizard() {

    this.onPrev = function () { }
    this.onNext = function () { }

    var wizard = this;
    var navigate = function (panel, direction) {
        var layout = panel.getLayout();
        layout[direction]();
        Ext.getCmp('move-prev').setDisabled(!layout.getPrev());
        Ext.getCmp('move-next').setDisabled(!layout.getNext());
        wizard["on" + direction.charAt(0).toUpperCase() + direction.slice(1)]();
    };

    var wizardControl = Ext.create('Ext.panel.Panel', {
        title: 'Example Wizard',
        id: "wizardControl",
        layout: 'card',
        hidden:true,
        bodyStyle: 'padding:15px',
        defaults: {
            border: false
        },
        bbar: [
            {
                id: 'move-prev',
                text: 'Back',
                handler: function (btn) {
                    navigate(btn.up("panel"), "prev");
                },
                disabled: true
            },
            '->',
            {
                id: 'move-next',
                text: 'Next',
                handler: function (btn) {
                    navigate(btn.up("panel"), "next");
                }
            }
        ]
    });

    this.setSize = function (width, height) {
        wizardControl.setSize(width, height);
    }

    this.setItems = function (views) {
        for (var i = 0; i < views.length; i++) {
            wizardControl.add(i, { id: "card-" + i, html: views[i] });
        }
        wizardControl.show();
    }

    this.getControl = function () {
        return wizardControl;
    }
}
    
function WizardContainer() {
    var window = Ext.create('Ext.window.Window', {
        title: 'Hello',
        id:'popupWindow',
        layout: 'vbox'
    });

    this.show = function () {
        window.show();
        window.maximize(false);
    }

    this.getSize = function () {
        return { width: window.getWidth(), height: window.getHeight() - window.getHeader().getHeight()};
    }

    this.addItem = function (control) {
        window.add(control);
    }

    this.Refresh = function () {
        window.doLayout();
    }
}
    

function WizardController(models) {
    var wizard = new Wizard();
    var slider = new Slider(models.length);
    var titleLayout = new TitleLayout();
    var wizardContainer = new WizardContainer();
    wizardContainer.addItem(titleLayout.getControl());
    wizardContainer.addItem(slider.getControl());
    wizardContainer.addItem(wizard.getControl());
    var position = 0;
    wizard.onPrev = function () {
        position--;
        slider.prev();
        titleLayout.setTitle(models[position].title);
        wizardContainer.Refresh();

    }
    wizard.onNext = function () {
        position++;
        slider.next();
        titleLayout.setTitle(models[position].title);
        wizardContainer.Refresh();
    }
    var views = new Array();
    var getViews = function () {
        for (var i = 0; i < models.length; i++) {
            views[i] = models[i].html;
        }
    }

    getViews();

    var setInternalWizardViews = function () {
        //if (views.length != models.length) {
        //    setTimeout(setInternalWizardViews, 25);
        //    return;
        //}
        wizard.setItems(views);
    };        

    var setWizardViews = function () {
        setInternalWizardViews();
    };

    this.startWizard = function () {
        setWizardViews();
        titleLayout.setTitle(models[0].title)
        slider.setVisible();
        wizardContainer.show();
        var wizardContainerSize = wizardContainer.getSize();
        wizard.setSize(0.95 * wizardContainerSize.width, 0.7 * wizardContainerSize.height);
        slider.setSize(0.95 * wizardContainerSize.width, 0.1 * wizardContainerSize.height);
        titleLayout.setSize(0.95 * wizardContainerSize.width, 0.1 * wizardContainerSize.height);
    }
}
    




