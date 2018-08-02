import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, PreloadAllModules } from '@angular/router';
import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { DashboardComponent } from '@modules/dashboard/dashboard';

import { AppComponent } from './app.component';
import { AppRoutes } from './app.routes';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    RouterModule.forRoot(AppRoutes, {
      useHash: Boolean(history.pushState) === false,
      preloadingStrategy: PreloadAllModules
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
