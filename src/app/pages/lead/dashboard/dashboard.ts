import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  teamMembers: any[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.teamMembers = this.userService.getTeamMembers();
  }
}