import {
  Component
} from '@angular/core';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.html'
})

export class DashboardComponent {
  public ngOnInit() {
    console.log('Dashboard Init');
  }
}
