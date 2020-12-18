import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatTableModule} from '@angular/material/table';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSelectModule} from '@angular/material/select';
import {MatDividerModule} from '@angular/material/divider';

const MATERIAL = [
  MatFormFieldModule,
  MatRadioModule,
  MatButtonModule,
  MatCardModule,
  MatDatepickerModule,
  MatInputModule,
  MatIconModule,
  MatExpansionModule,
  MatDialogModule,
  MatProgressSpinnerModule,
  MatToolbarModule,
  MatSnackBarModule,
  MatSidenavModule,
  MatTableModule,
  MatButtonToggleModule,
  MatSlideToggleModule,
  MatSelectModule,
  MatDividerModule
];

@NgModule({
  imports: MATERIAL,
  exports: MATERIAL
})
export class MaterialModule { }