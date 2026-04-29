import { Component } from '@angular/core';
import {Navbar} from '../../layout/navbar/navbar';
import {Footer} from '../../layout/footer/footer';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-home',
  imports: [RouterLink,Navbar, Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
