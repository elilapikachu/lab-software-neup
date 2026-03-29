import { Component } from '@angular/core';
import {Navbar} from '../navbar/navbar';
import {Footer} from '../footer/footer';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-home',
  imports: [RouterLink,Navbar, Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
