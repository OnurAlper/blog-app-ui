import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

import { AuthGuard } from './shared/guards/auth.guard';
import { LoginGuard } from './shared/guards/loginGuard'; // ✅ Bunu ekledik
import { ProfileComponent } from './features/profile/profile.component';
import { HomeComponent } from './features/dashboard/home/home.component';
import { BlogViewComponent } from './features/blog/blog-view/blog-view.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [LoginGuard] },

  {
  path: '',
  component: DashboardComponent,
  canActivate: [AuthGuard],
  data: { roles: ['Admin', 'Client'] },
  children: [
    { path: '', component: HomeComponent }, // 🔥 boş alt path → home
    { path: 'dashboard', redirectTo: '', pathMatch: 'full' }, // 🔁 yönlendirme
    { path: 'profile', component: ProfileComponent },

    { path: 'blog', component: BlogViewComponent, data: { roles: ['Admin', 'Client'] } },
  ]
},


  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
