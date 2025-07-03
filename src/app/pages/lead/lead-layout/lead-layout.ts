import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LeadSidebar } from '../lead-sidebar/lead-sidebar';

@Component({
  selector: 'app-lead-layout',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    LeadSidebar
  ],
  templateUrl: './lead-layout.html',
  styleUrls: ['./lead-layout.css']
})
export class LeadLayout {}