import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

import { ShowroomComponent } from '@module/showroom/showroom.component';

const routes: Routes = [
  { path: '', redirectTo: '/showroom', pathMatch: 'full' },
  { path: 'showroom', component: ShowroomComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: Boolean(history.pushState) === false,
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})

export class AppRoutes { }
