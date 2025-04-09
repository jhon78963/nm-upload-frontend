import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabProductPage } from './tab-product.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { TabProductPageRoutingModule } from './tab-product-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    TabProductPageRoutingModule
  ],
  declarations: [TabProductPage]
})
export class TabProductPageModule {}
