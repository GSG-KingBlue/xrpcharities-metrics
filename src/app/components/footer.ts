import { Component } from '@angular/core';

@Component({
    selector: 'app-footer',
    templateUrl: 'footer.html'
})
export class AppFooterComponent {
    constructor() {
        var xrpTipbotScript = document.createElement("script");
        xrpTipbotScript.setAttribute("id", "xrpTipbotScript");
        xrpTipbotScript.setAttribute("src", "https://www.xrptipbot.com/static/donate/tipper.js");
        document.body.appendChild(xrpTipbotScript);
    }
}
