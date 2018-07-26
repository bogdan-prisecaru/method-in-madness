import {
  Component
} from '@angular/core';

@Component({
  selector: 'app',
  templateUrl: './app.component.html'
})

export class AppComponent {
  public ngOnInit() {
    console.log('Initial App State');
  }
}
