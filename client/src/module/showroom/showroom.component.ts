import {
  Component,
  OnInit
} from '@angular/core';

@Component({
  selector: 'showroom',
  templateUrl: './showroom.component.html',
  styleUrls: []
})

export class ShowroomComponent implements OnInit {
  public ngOnInit() {
    console.log('Showroom UI init');
  }
}
