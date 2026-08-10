sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
    "use strict";
    return UIComponent.extend("sap.fiori.Component", {
        metadata: {
            manifest: "json"
        },
        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            // Set a simple JSON model for demo purposes (optional)
            var oData = { hello: "Welcome to KWSB File Tracking" };
            var oModel = new JSONModel(oData);
            this.setModel(oModel, "demo");
        }
    });
});
