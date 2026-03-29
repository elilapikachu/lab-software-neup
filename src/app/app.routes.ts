import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { LoginAndRegister } from './pages/login-and-register/login-and-register';
import { Aboutus } from './pages/aboutus/aboutus';
import { Recipes } from './pages/recipes/recipes';
import { Diet } from './pages/diet/diet';
import { UserProfile } from './pages/user-profile/user-profile';
import path from 'path';

export const routes: Routes = [
    { path: '', component: Home }, //raiz
    { path: 'loginandregister', component: LoginAndRegister }, 
    { path: 'aboutus', component: Aboutus }, 
    { path: 'recipes', component: Recipes }, 
    { path: 'diet', component: Diet },   
    { path: 'userprofile', component: UserProfile },
    { path: '**', redirectTo: '' } //ruta no encontrada 
];
