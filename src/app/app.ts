// app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './pages/home/header/header';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Footer } from './pages/home/footer/footer';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {}