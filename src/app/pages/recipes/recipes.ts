import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {Navbar} from '../navbar/navbar';
import {Footer} from '../footer/footer';

@Component({
  selector: 'app-recipes',
  imports: [RouterLink,Navbar, Footer],
  templateUrl: './recipes.html',
  styleUrl: './recipes.scss',
})
export class Recipes {}
