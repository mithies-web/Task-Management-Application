import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
  textColor: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="features" class="bg-white w-full py-16 md:full-screen">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 lg:py-12 md:py-20">
        <div class="text-center mb-12 md:mb-20">
          <h2 class="lg:text-4xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
            Key Features to Boost Your Productivity
          </h2>
          <p class="lg:text-xl md:text-xl text-gray-600 max-w-4xl mx-auto">
            Create new solutions to improve your team's ability to manage projects effectively
          </p>
        </div>
        
        <div class="features-slider">
          <div class="features-track" [style.transform]="'translateX(-' + (currentSlide * 100) + '%)'">
            <div class="feature-slide" *ngFor="let slide of featureSlides; let i = index">
              <div 
                class="feature-card bg-white p-6 md:p-8 lg:p-10 rounded-xl shadow-md border border-gray-100"
                *ngFor="let feature of slide">
                <div class="lg:w-12 lg:h-12 md:w-14 md:h-14 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center lg:mb-6 md:mb-8 sm:mb-4"
                     [ngClass]="[feature.bgColor, feature.textColor]">
                  <i [class]="'fas ' + feature.icon + ' lg:text-xl md:text-2xl sm:text-lg'"></i>
                </div>
                <h3 class="lg:text-2xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{{ feature.title }}</h3>
                <p class="lg:text-md md:text-lg text-gray-600">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Features Pagination -->
        <div class="features-pagination flex justify-center lg:mt-8 md:mt-10 space-x-2">
          <button 
            *ngFor="let dot of [0,1,2]; let i = index"
            class="pagination-dot w-3 h-3 rounded-full cursor-pointer"
            [ngClass]="currentSlide === i ? 'bg-primary' : 'bg-gray-300'"
            (click)="setSlide(i)">
          </button>
        </div>
        
        <!-- Navigation Arrows -->
        <div class="flex justify-center mt-6 space-x-4">
          <button 
            (click)="previousSlide()"
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-full">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button 
            (click)="nextSlide()"
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-full">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .features-slider {
      overflow-x: hidden;
      position: relative;
    }
    
    .features-track {
      display: flex;
      transition: transform 0.5s ease;
      width: 300%; /* 3 slides */
    }
    
    .feature-slide {
      flex: 0 0 100%;
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      padding: 0 1rem;
    }
    
    @media (max-width: 1024px) {
      .feature-slide {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 640px) {
      .feature-slide {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FeaturesComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  totalSlides = 3;
  autoSlideInterval: any;

  features: Feature[] = [
    {
      icon: 'fa-lightbulb',
      title: 'Innovative Solutions',
      description: 'Build solutions with multiple opportunities to ensure your team is always ready for any challenge.',
      bgColor: 'bg-primary/10',
      textColor: 'text-primary'
    },
    {
      icon: 'fa-users',
      title: 'Customer-Centric',
      description: 'Develop new solutions focused on improving your customers\' ability to manage their workflows.',
      bgColor: 'bg-success/10',
      textColor: 'text-success'
    },
    {
      icon: 'fa-thumbs-up',
      title: 'Satisfaction Focused',
      description: 'Promote improvements that directly address your customers\' needs and enhance satisfaction.',
      bgColor: 'bg-warning/10',
      textColor: 'text-warning'
    },
    {
      icon: 'fa-headset',
      title: 'Service Excellence',
      description: 'Continuously improve customer service through responsive support and regular updates.',
      bgColor: 'bg-secondary/10',
      textColor: 'text-secondary'
    },
    {
      icon: 'fa-bell',
      title: 'Smart Notifications',
      description: 'Get timely alerts for deadlines, updates, and important project milestones.',
      bgColor: 'bg-danger/10',
      textColor: 'text-danger'
    },
    {
      icon: 'fa-chart-line',
      title: 'Advanced Analytics',
      description: 'Track team performance and project progress with comprehensive dashboards.',
      bgColor: 'bg-primary/10',
      textColor: 'text-primary'
    }
  ];

  featureSlides: Feature[][] = [];

  ngOnInit() {
    this.setupFeatureSlides();
    this.startAutoSlide();
  }

  ngOnDestroy() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  setupFeatureSlides() {
    // Split features into 3 slides with 2 features each
    this.featureSlides = [
      this.features.slice(0, 2), // First 2 features
      this.features.slice(2, 4), // Next 2 features
      this.features.slice(4, 6)  // Last 2 features
    ];
  }

  setSlide(index: number) {
    this.currentSlide = index;
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
  }

  previousSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }
}