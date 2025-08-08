import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MaterialModule } from './shared/material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { TokenInterceptor } from './shared/interceptors/token.interceptor';
import { LanguageInterceptor } from './shared/interceptors/language.interceptor';

import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UserMenuComponent } from './shared/components/user-menu/user-menu.component';
import { ProfileComponent } from './features/profile/profile.component';
import { HomeComponent } from './features/dashboard/home/home.component';
import { BlogViewComponent } from './features/admin/blog/blog-view/blog-view.component';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

// ✅ Ngx-mask
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

// 📌 Locale importları
import { registerLocaleData } from '@angular/common';
import localeTr from '@angular/common/locales/tr';
import localeEn from '@angular/common/locales/en';
import { BlogCreateComponent } from './features/admin/blog/blog-create/blog-create.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { BlogEditComponent } from './features/admin/blog/blog-edit/blog-edit.component';
import { SafeHtmlPipe } from './shared/pipes/safe-html.pipe';
// 📌 Locale'leri kaydet
registerLocaleData(localeTr, 'tr');
registerLocaleData(localeEn, 'en');

// 🔁 Çeviri dosyalarının yolu
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    UserMenuComponent,
    ProfileComponent,
    HomeComponent,
    BlogViewComponent,
    BlogCreateComponent,
    BlogEditComponent,
    SafeHtmlPipe
  ],
  imports: [
    BrowserModule,
    NgApexchartsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MaterialModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    FormsModule,
    NgxMatSelectSearchModule,
    NgxMaskDirective,
    TranslateModule.forRoot({
      defaultLanguage: 'tr',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LanguageInterceptor,
      multi: true
    },
    {
      // 📌 LOCALE_ID aktif dile göre ayarlanıyor
      provide: LOCALE_ID,
      deps: [TranslateService],
      useFactory: (translate: TranslateService) => translate.currentLang || 'tr'
    },
    provideHttpClient(withInterceptorsFromDi()),
    provideNgxMask()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
