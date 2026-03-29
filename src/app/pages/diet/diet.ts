import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {Navbar} from '../navbar/navbar';
import {Footer} from '../footer/footer';

@Component({
  selector: 'app-diet',
  imports: [RouterLink,Navbar, Footer],
  templateUrl: './diet.html',
  styleUrl: './diet.scss',
})
export class Diet {}
