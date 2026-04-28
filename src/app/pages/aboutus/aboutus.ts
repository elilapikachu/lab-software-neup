import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {Navbar} from '../../layout/navbar/navbar';
import {Footer} from '../../layout/footer/footer';

@Component({
  selector: 'app-aboutus',
  imports: [RouterLink,Navbar, Footer],
  templateUrl: './aboutus.html',
  styleUrl: './aboutus.scss',
})
export class Aboutus {}
