import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { LoginAndRegister } from './pages/login-and-register/login-and-register';
import { Aboutus } from './pages/aboutus/aboutus';
import { Recipes } from './pages/recipes/recipes';
import { Diet } from './pages/diet/diet';
import { UserProfile } from './pages/user-profile/user-profile';
import { Creatediet } from './pages/creatediet/creatediet';
import path from 'path';
import { CreateRecipe } from './pages/create-recipe/create-recipe';
import { ViewSaved } from './pages/view-saved/view-saved';
import { ViewDiet } from './pages/view-diet/view-diet';
import { ViewRecipe } from './pages/view-recipe/view-recipe';

export const routes: Routes = [
    { path: '', component: Home }, //raiz
    { path: 'loginandregister', component: LoginAndRegister },
    { path: 'aboutus', component: Aboutus },
    { path: 'recipes', component: Recipes },
    { path: 'diet', component: Diet },
    { path: 'userprofile', component: UserProfile },
    { path: 'creatediet', component: Creatediet },
    { path: 'createrecipe', component: CreateRecipe },
    { path: 'viewsaved', component: ViewSaved },
    { path: 'viewdiet', component: ViewDiet },
    { path: 'viewrecipe', component: ViewRecipe },
    { path: '**', redirectTo: '' } //ruta no encontrada 
];
