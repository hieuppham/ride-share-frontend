import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  ],
  bootstrap: [AdminComponent],
})
export class AdminModule {}
