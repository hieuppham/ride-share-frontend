import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { LoginComponent } from './login/login.component';
import { Page404Component } from './page404/page404.component';
import { Page500Component } from './page500/page500.component';
import {
  ButtonModule,
  CardModule,
  FormModule,
  GridModule,
  ModalModule,
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';

@NgModule({
  declarations: [LoginComponent, Page404Component, Page500Component],
  imports: [
    CommonModule,
    PagesRoutingModule,
    CardModule,
    ButtonModule,
    GridModule,
    IconModule,
    FormModule,
    ModalModule,
  ],
})
export class PagesModule {}
