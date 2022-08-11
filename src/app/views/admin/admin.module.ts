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
} from '@coreui/angular';
import { AdminRoutingModule } from './admin-routing.module';
import { UserComponent } from './user/user.component';
import { RideComponent } from './ride/ride.component';
import { AdminComponent } from './admin.component';
// import { DefaultHeaderComponent } from '../../containers/default-header/default-header.component';
@NgModule({
  imports: [
    CardModule,
    GridModule,
    AvatarModule,
    TableModule,
    AdminRoutingModule,
    CommonModule,
    ModalModule,
    BadgeModule,
    NavModule,
    DropdownModule,
  ],
  declarations: [
    UserComponent,
    RideComponent,
    AdminComponent,
    // DefaultHeaderComponent,
  ],
  bootstrap: [AdminComponent],
})
export class AdminModule {}
