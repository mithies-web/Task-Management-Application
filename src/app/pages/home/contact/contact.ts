import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ValidationErrors {
  name: boolean;
  email: boolean;
  message: boolean;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section id="contact" class="bg-gray-50 w-full py-16 md:full-screen">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 max-w-4xl">
        <div class="text-center mb-12 md:mb-16">
          <h2 class="lg:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">Get In Touch</h2>
          <p class="lg:text-lg md:text-xl text-gray-600">Have questions? We'd love to hear from you.</p>
        </div>
        
        <form (ngSubmit)="onSubmit()" #contactForm="ngForm" class="space-y-4 md:space-y-6">
          <div class="grid md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label for="name" class="block lg:text-sm md:text-lg font-medium text-gray-700 lg:mb-1 md:mb-2">
                Name<span class="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                [(ngModel)]="formData.name"
                required 
                (blur)="validateField('name')"
                class="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base md:text-lg">
              <p class="mt-1 text-sm text-red-500" [class.hidden]="!errors.name">Please enter your name</p>
            </div>
            <div>
              <label for="email" class="block lg:text-sm md:text-lg font-medium text-gray-700 lg:mb-1 md:mb-2">
                Email<span class="text-red-500">*</span>
              </label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                [(ngModel)]="formData.email"
                required 
                (blur)="validateField('email')"
                class="w-full lg:px-4 lg:py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent lg:text-sm md:text-lg">
              <p class="mt-1 text-sm text-red-500" [class.hidden]="!errors.email">Please enter a valid email</p>
            </div>
          </div>
          
          <div>
            <label for="subject" class="block text-base md:text-lg font-medium text-gray-700 lg:mb-1 md:mb-2">Subject</label>
            <input 
              type="text" 
              id="subject" 
              name="subject" 
              [(ngModel)]="formData.subject"
              class="w-full lg:px-4 lg:py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent lg:text-sm md:text-lg">
          </div>
          
          <div>
            <label for="message" class="block text-base md:text-lg font-medium text-gray-700 lg:mb-1 md:mb-2">
              Message<span class="text-red-500">*</span>
            </label>
            <div 
              #messageDiv
              contenteditable="true"
              (input)="onMessageInput($event)"
              (focus)="onMessageFocus()"
              (blur)="onMessageBlur()"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px] bg-white lg:text-sm md:text-lg"
              [attr.placeholder]="messagePlaceholder">
            </div>
            <div class="flex justify-between items-center mt-1">
              <p class="text-sm text-red-500" [class.hidden]="!errors.message">{{ messageError }}</p>
              <p class="text-sm text-gray-500" [ngClass]="{'text-red-500': charCount > maxChars}">
                Characters: {{ charCount }}/{{ maxChars }}
              </p>
            </div>
          </div>
          
          <div>
            <button 
              type="submit" 
              class="bg-primary hover:bg-primary/90 text-white lg:px-6 lg:py-3 md:px-8 md:py-4 rounded-lg lg:text-lg md:text-xl font-medium transition-all duration-300 transform hover:scale-105 w-full md:w-auto">
              Send Message
            </button>
          </div>
        </form>
      </div>
    </section>
  `
})
export class ContactComponent implements AfterViewInit {
  @ViewChild('messageDiv') messageDiv!: ElementRef;

  formData: ContactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  errors: ValidationErrors = {
    name: false,
    email: false,
    message: false
  };

  charCount = 0;
  maxChars = 500;
  messagePlaceholder = 'Type your message here...';
  messageError = 'Please enter your message';
  isMessageFocused = false;

  ngAfterViewInit() {
    this.initializeMessagePlaceholder();
  }

  initializeMessagePlaceholder() {
    if (this.messageDiv && this.messageDiv.nativeElement.textContent.trim() === '') {
      this.messageDiv.nativeElement.textContent = this.messagePlaceholder;
      this.messageDiv.nativeElement.classList.add('text-gray-400');
    }
  }

  onMessageInput(event: Event) {
    const target = event.target as HTMLElement;
    const content = target.textContent || '';
    
    if (content === this.messagePlaceholder) {
      this.charCount = 0;
      return;
    }

    this.charCount = content.length;
    this.formData.message = content;
    
    // Remove placeholder styling when user types
    target.classList.remove('text-gray-400');
    
    // Update border color based on character count
    if (this.charCount > this.maxChars) {
      target.classList.add('border-red-500');
    } else {
      target.classList.remove('border-red-500');
    }
  }

  onMessageFocus() {
    this.isMessageFocused = true;
    const element = this.messageDiv.nativeElement;
    if (element.textContent === this.messagePlaceholder) {
      element.textContent = '';
      element.classList.remove('text-gray-400');
    }
  }

  onMessageBlur() {
    this.isMessageFocused = false;
    const element = this.messageDiv.nativeElement;
    if (element.textContent.trim() === '') {
      element.textContent = this.messagePlaceholder;
      element.classList.add('text-gray-400');
      this.charCount = 0;
    }
    this.validateField('message');
  }

  validateField(field: keyof ValidationErrors) {
    switch (field) {
      case 'name':
        this.errors.name = this.formData.name.trim() === '';
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        this.errors.email = !emailRegex.test(this.formData.email.trim());
        break;
      case 'message':
        const messageContent = this.messageDiv.nativeElement.textContent.trim();
        if (messageContent === '' || messageContent === this.messagePlaceholder) {
          this.errors.message = true;
          this.messageError = 'Please enter your message';
        } else if (this.charCount > this.maxChars) {
          this.errors.message = true;
          this.messageError = `Message exceeds ${this.maxChars} character limit`;
        } else {
          this.errors.message = false;
        }
        break;
    }
  }

  onSubmit() {
    // Validate all fields
    this.validateField('name');
    this.validateField('email');
    this.validateField('message');

    // Update message from contenteditable div
    const messageContent = this.messageDiv.nativeElement.textContent.trim();
    if (messageContent !== this.messagePlaceholder) {
      this.formData.message = messageContent;
    } else {
      this.formData.message = '';
    }

    const isValid = !this.errors.name && !this.errors.email && !this.errors.message;

    if (isValid) {
      // In a real application, you would submit the form here
      alert("Thank you for contacting us! We'll get back to you soon.");
      
      // Reset the form
      this.resetForm();
    } else {
      // Scroll to the first error
      const firstError = document.querySelector('.text-red-500:not(.hidden)');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  resetForm() {
    this.formData = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
    
    this.errors = {
      name: false,
      email: false,
      message: false
    };
    
    this.charCount = 0;
    this.messageDiv.nativeElement.textContent = this.messagePlaceholder;
    this.messageDiv.nativeElement.classList.add('text-gray-400');
    this.messageDiv.nativeElement.classList.remove('border-red-500');
  }
}