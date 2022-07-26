import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MapboxComponent } from './mapbox.component';

const routes: Routes = [
  {
    path: '',
    component: MapboxComponent,
    data: {
      title: `Map`,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapboxRoutingModule {}
