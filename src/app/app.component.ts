import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private translate: TranslateService) {
    translate.addLangs(['en', 'tr']);
    translate.setDefaultLang('tr');

    const savedLang = localStorage.getItem('language');

    if (savedLang && ['en', 'tr'].includes(savedLang)) {
      translate.use(savedLang);
    } else {
      const browserLang = translate.getBrowserLang();
      const langToUse = ['en', 'tr'].includes(browserLang!) ? browserLang! : 'tr';
      translate.use(langToUse);
      localStorage.setItem('language', langToUse);
    }
  }
}
