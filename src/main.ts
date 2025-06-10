import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../src/app/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
