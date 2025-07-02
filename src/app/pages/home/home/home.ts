import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../hero/hero';
import { FeaturesComponent } from '../features/features';
import { ImpactsComponent } from '../impacts/impacts';
import { TestimonialsComponent } from '../testinomials/testinomials';
import { ContactComponent } from '../contact/contact';
import { FooterComponent } from '../footer/footer';
import { BackToTopComponent } from '../back-to-top/back-to-top';
import { Header } from '../header/header';
import { About } from '../about/about';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    Header,
    HeroComponent,
    About,
    FeaturesComponent,
    ImpactsComponent,
    TestimonialsComponent,
    ContactComponent,
    FooterComponent,
    BackToTopComponent
  ],
  template: `
    <app-back-to-top></app-back-to-top>
    <app-header></app-header>
    <main>
      <app-hero></app-hero>
      <app-about></app-about>
      <app-features></app-features>
      <app-impacts></app-impacts>
      <app-testimonials></app-testimonials>
      <app-contact></app-contact>
    </main>
    <app-footer></app-footer>
  `
})
export class Home {
  title = 'GenFlow - Task Management';
}