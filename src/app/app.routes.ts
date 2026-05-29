import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
    { path: 'loginandregister', loadComponent: () => import('./pages/login-and-register/login-and-register').then(m => m.LoginAndRegister) },
    { path: 'aboutus', loadComponent: () => import('./pages/aboutus/aboutus').then(m => m.Aboutus) },
    { path: 'recipes', loadComponent: () => import('./pages/recipes/recipes').then(m => m.Recipes) },
    { path: 'diet', loadComponent: () => import('./pages/diet/diet').then(m => m.Diet) },
    { path: 'userprofile', loadComponent: () => import('./pages/user-profile/user-profile').then(m => m.UserProfile) },
    { path: 'creatediet', loadComponent: () => import('./pages/creatediet/creatediet').then(m => m.Creatediet) },
    { path: 'createrecipe', loadComponent: () => import('./pages/create-recipe/create-recipe').then(m => m.CreateRecipe) },
    { path: 'viewsaved', loadComponent: () => import('./pages/view-saved/view-saved').then(m => m.ViewSaved) },
    { path: 'viewdiet/:id', loadComponent: () => import('./pages/view-diet/view-diet').then(m => m.ViewDiet) },
    { path: 'viewrecipe/:id', loadComponent: () => import('./pages/view-recipe/view-recipe').then(m => m.ViewRecipe) },
    { path: 'editrecipe/:id', loadComponent: () => import('./pages/create-recipe/create-recipe').then(m => m.CreateRecipe) },
    { path: 'editdiet/:id', loadComponent: () => import('./pages/creatediet/creatediet').then(m => m.Creatediet) },
    { path: '**', redirectTo: '' },
];
