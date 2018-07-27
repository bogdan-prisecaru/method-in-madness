import { NgModule } from '@angular/core';

import { BarChartComponent } from '@shared/components/barChart/barChart.component';
import { ChordComponent } from '@shared/components/chord/chord.component';

@NgModule({
  declarations: [
    BarChartComponent,
    ChordComponent
  ],
  imports: [],
  exports: [
    BarChartComponent,
    ChordComponent
  ]
})


export class SharedModule { }
