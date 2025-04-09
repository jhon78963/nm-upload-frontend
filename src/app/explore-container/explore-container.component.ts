import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
  standalone: false,
})
export class ExploreContainerComponent implements OnInit {

  @Input() name?: string;
  @Input() placeholder?: string;
  @Input() object: any[] = [];

  ngOnInit(): void {
    console.log(this.object);
  }

  handleChange(event: any) {
    console.log(event.detail.value);
  }
}
