import { Component } from '@angular/core';
import { items, links } from './models/data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'spider';
   items = items;
  links = links;
  selectedId = items[0]?.id;
}
