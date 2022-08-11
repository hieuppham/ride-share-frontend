import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from '@coreui/angular';
import {
  AvatarModule,
  CardModule,
  GridModule,
  TableModule,
  ModalModule,
} from '@coreui/angular';

import { ReactiveFormsModule } from '@angular/forms';

import { MapboxComponent } from './mapbox.component';

@NgModule({
  imports: [
    CardModule,
    GridModule,
    AvatarModule,
    TableModule,
    ModalModule,
    ReactiveFormsModule,
    CommonModule,
    ToastModule,
  ],
  declarations: [MapboxComponent],
})
export class MapboxModule {}
