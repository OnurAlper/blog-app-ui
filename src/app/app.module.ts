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
import { TagListComponent } from './features/admin/tag/tag-list/tag-list.component';
import { TagCreateComponent } from './features/admin/tag/tag-create/tag-create.component';
import { TagEditComponent } from './features/admin/tag/tag-edit/tag-edit.component';
import { VerifyComponent } from './features/auth/verify/verify.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { UserListComponent } from './features/admin/users/user-list/user-list.component';
import { CategoryListComponent } from './features/admin/category/category-list/category-list.component';
import { CategoryCreateComponent } from './features/admin/category/category-create/category-create.component';
import { CategoryEditComponent } from './features/admin/category/category-edit/category-edit.component';
import { CommentListComponent } from './features/admin/comment/comment-list/comment-list.component';
import { BlogListComponent } from './features/client/blog/blog-list/blog-list.component';
import { BlogDetailComponent } from './features/client/blog/blog-detail/blog-detail.component';
import { ClientHomeComponent } from './features/client/home/client-home.component';
import { NotificationBellComponent } from './shared/components/notification-bell/notification-bell.component';
import { SiteSettingsComponent } from './features/admin/site-settings/site-settings.component';
import { AdminLogListComponent } from './features/admin/admin-log/admin-log-list.component';
import { ForumHomeComponent } from './features/forum/forum-home/forum-home.component';
import { ForumCategoryComponent } from './features/forum/forum-category/forum-category.component';
import { ForumThreadComponent } from './features/forum/forum-thread/forum-thread.component';
import { ForumCreateThreadComponent } from './features/forum/forum-create-thread/forum-create-thread.component';
import { ForumModerationComponent } from './features/admin/forum-moderation/forum-moderation.component';
import { PollListComponent } from './features/polls/poll-list/poll-list.component';
import { PollCreateComponent } from './features/polls/poll-create/poll-create.component';
import { PollEditComponent } from './features/polls/poll-edit/poll-edit.component';
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
    TagListComponent,
    TagCreateComponent,
    TagEditComponent,
    SafeHtmlPipe,
    VerifyComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    UserListComponent,
    CategoryListComponent,
    CategoryCreateComponent,
    CategoryEditComponent,
    CommentListComponent,
    BlogListComponent,
    BlogDetailComponent,
    ClientHomeComponent,
    NotificationBellComponent,
    SiteSettingsComponent,
    AdminLogListComponent,
    ForumHomeComponent,
    ForumCategoryComponent,
    ForumThreadComponent,
    ForumCreateThreadComponent,
    ForumModerationComponent,
    PollListComponent,
    PollCreateComponent,
    PollEditComponent
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
