import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {Navbar} from '../../layout/navbar/navbar';
import {Footer} from '../../layout/footer/footer';

@Component({
  selector: 'app-recipes',
  imports: [RouterLink,Navbar, Footer],
  templateUrl: './recipes.html',
  styleUrl: './recipes.scss',
})
export class Recipes {}
