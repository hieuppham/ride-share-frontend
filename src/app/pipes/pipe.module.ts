import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenderPipe } from './gender.pipe';
import { DateInArrayPipe } from './date-in-array.pipe';
import { StatusPipe } from './status.pipe';
import { VehiclePipe } from './vehicle.pipe';
import { AvatarPipe } from './avatar.pipe';
import { UpdateStatusPipe } from './update-status.pipe';
import { MetricPipe } from './metric.pipe';
import { DateInMilisecPipe } from './date-in-milisec.pipe';
import { DateLocalPipe } from './date-local.pipe';

@NgModule({
  declarations: [
    GenderPipe,
    DateInArrayPipe,
    StatusPipe,
    VehiclePipe,
    AvatarPipe,
    UpdateStatusPipe,
    MetricPipe,
    DateInMilisecPipe,
    DateLocalPipe,
  ],
  imports: [CommonModule],
  exports: [
    GenderPipe,
    DateInArrayPipe,
    StatusPipe,
    VehiclePipe,
    AvatarPipe,
    UpdateStatusPipe,
    MetricPipe,
    DateInMilisecPipe,
    DateLocalPipe,
  ],
})
export class PipeModule {}
