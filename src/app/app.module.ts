import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NetworkVisualizationComponent } from './components/network-visualization.component';

@NgModule({
  declarations: [
    AppComponent,
    NetworkVisualizationComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
