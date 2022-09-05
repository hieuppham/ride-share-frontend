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
import { PipeModule } from 'src/app/pipes/pipe.module';
import { VehiclePipe } from 'src/app/pipes/vehicle.pipe';
import { DateInArrayPipe } from 'src/app/pipes/date-in-array.pipe';
import { AvatarPipe } from 'src/app/pipes/avatar.pipe';
import { MetricPipe } from 'src/app/pipes/metric.pipe';
import { FormsModule } from '@angular/forms';
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
    PipeModule,
    FormsModule,
  ],
  declarations: [MapboxComponent],
  providers: [VehiclePipe, DateInArrayPipe, AvatarPipe, MetricPipe],
})
export class MapboxModule {}
