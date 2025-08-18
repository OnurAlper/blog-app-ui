import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

import { AuthGuard } from './shared/guards/auth.guard';
import { LoginGuard } from './shared/guards/loginGuard'; // ✅ Bunu ekledik
import { ProfileComponent } from './features/profile/profile.component';
import { HomeComponent } from './features/dashboard/home/home.component';
import { BlogViewComponent } from './features/admin/blog/blog-view/blog-view.component';
import { BlogCreateComponent } from './features/admin/blog/blog-create/blog-create.component';
import { BlogEditComponent } from './features/admin/blog/blog-edit/blog-edit.component';
import { PendingChangesGuard } from './shared/guards/pending-changes.guard';
import { TagListComponent } from './features/admin/tag/tag-list/tag-list.component';
import { TagCreateComponent } from './features/admin/tag/tag-create/tag-create.component';
import { TagEditComponent } from './features/admin/tag/tag-edit/tag-edit.component';
import { VerifyComponent } from './features/auth/verify/verify.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [LoginGuard] },
  { path: 'verify', component: VerifyComponent }, 

  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [LoginGuard] },
  { path: 'reset-password',  component: ResetPasswordComponent },
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { roles: ['Admin', 'Client'] },
    children: [
      { path: '', component: HomeComponent }, // 🔥 boş alt path → home
      { path: 'dashboard', redirectTo: '', pathMatch: 'full' }, // 🔁 yönlendirme
      { path: 'profile', component: ProfileComponent },

      { path: 'blog', component: BlogViewComponent, data: { roles: ['Admin'] } },
      { path: 'blog/blog-create', component: BlogCreateComponent, data: { roles: ['Admin'] } },
      { path: 'blog/blog-edit/:id', component: BlogEditComponent, data: { roles: ['Admin'] }, canDeactivate: [PendingChangesGuard] },

      { path: 'tags', component: TagListComponent, data: { roles: ['Admin'] } },
      { path: 'tags/create', component: TagCreateComponent, data: { roles: ['Admin'] } },
      { path: 'tags/edit/:id', component: TagEditComponent, data: { roles: ['Admin'] }, canDeactivate: [PendingChangesGuard] },

    ]
  },


  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
