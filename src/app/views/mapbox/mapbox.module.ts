import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapboxComponent } from './mapbox.component';
import { MapboxRoutingModule } from './mapbox-routing.module';
import {
  CardModule,
  FormModule,
  ModalModule,
  GridModule,
  AvatarModule,
  ToastModule,
} from '@coreui/angular';

import { IconModule } from '@coreui/icons-angular';
@NgModule({
  declarations: [MapboxComponent],
  imports: [
    MapboxRoutingModule,
    CommonModule,
    CardModule,
    FormModule,
    ModalModule,
    GridModule,
    AvatarModule,
    ToastModule,
    IconModule,
  ],
})
export class MapboxModule {}
