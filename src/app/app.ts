// app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
  ],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: [`
    /* Smooth Scroll */
    html {
      scroll-behavior: smooth;
    }
    
    /* Hero Gradient */
    .hero-gradient {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    }
    
    /* Full Screen Sections - Adjusted for mobile */
    .full-screen {
      min-height: 100vh;
      display: flex;
      align-items: center;
    }
    
    /* Custom Hero Height */
    .hero-container {
      min-height: 91vh;
      display: flex;
      align-items: center;
    }
  `]
})
export class AppComponent {}