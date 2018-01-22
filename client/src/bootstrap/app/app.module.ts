import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgModule, ApplicationRef } from '@angular/core';
import { RouterModule, PreloadAllModules } from '@angular/router';

import { AppComponent } from './app.component';
import { AppRoutes } from './app.routes';

import { ShowroomComponent } from '@module/showroom/showroom.component';


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutes
  ],
  declarations: [
    AppComponent,
    ShowroomComponent
  ],
  providers: [], // services
  bootstrap: [AppComponent],
})


export class AppModule { }
