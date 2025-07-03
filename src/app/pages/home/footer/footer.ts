import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
})
export class FooterComponent {
  image: string = 'public/logo/logo.png';

  overviewLinks = [
    { text: 'About Us', href: '#about' },
    { text: 'Features', href: '#features' },
    { text: 'Impacts', href: '#impacts' },
    { text: 'Testimonials', href: '#testimonials' }
  ];

  contactInfo = [
    { icon: 'fa-envelope', text: 'genworx-ai@gmail.com' },
    { icon: 'fa-phone-alt', text: '+91 63833 50764' },
    { icon: 'fa-map-marker-alt', text: '123, Chennai, TN 600017 India' }
  ];
}