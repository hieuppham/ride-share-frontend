import { NgModule } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import {
  AvatarModule,
  CardModule,
  GridModule,
  TableModule,
  ModalModule,
  NavModule,
  BadgeModule,
  DropdownModule,
  HeaderModule,
  ButtonModule,
  BreadcrumbModule,
} from '@coreui/angular';

import { AdminRoutingModule } from './admin-routing.module';
import { UserComponent } from './user/user.component';
import { RideComponent } from './ride/ride.component';
import { AdminComponent } from './admin.component';
import { DefaultHeaderComponent } from './default-header/default-header.component';
import { PipeModule } from 'src/app/pipes/pipe.module';
import { UpdateStatusPipe } from 'src/app/pipes/update-status.pipe';
import { DateInMilisecPipe } from 'src/app/pipes/date-in-milisec.pipe';
import { ActivityComponent } from './activity/activity.component';
import { ConfigComponent } from './config/config.component';

@NgModule({
  imports: [
    CardModule,
    GridModule,
    AvatarModule,
    TableModule,
    AdminRoutingModule,
    CommonModule,
    HeaderModule,
    ModalModule,
    BadgeModule,
    NavModule,
    DropdownModule,
    ButtonModule,
    BreadcrumbModule,
    PipeModule,
  ],
  declarations: [
    UserComponent,
    RideComponent,
    AdminComponent,
    DefaultHeaderComponent,
    ActivityComponent,
    ConfigComponent,
  ],
  bootstrap: [AdminComponent],
  providers: [UpdateStatusPipe, DateInMilisecPipe, UpperCasePipe],
})
export class AdminModule {}
