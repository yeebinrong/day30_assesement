// Default imports
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// Import modules
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { HttpClientModule } from '@angular/common/http';
import {RouterModule, Routes} from '@angular/router';
import { WebcamModule } from 'ngx-webcam'

// Import Services
import { ApiService } from './api.service';
import {CameraService} from './camera.service';

// Components
import { AppComponent } from './app.component';
import { MainComponent } from './components/main.component';
import { CaptureComponent } from './components/capture.component';
import { LoginComponent } from './components/login.component';

// Routes
const ROUTES: Routes = [
	{ path: '', component: LoginComponent },
	{ path: 'main', component: MainComponent },
	{ path: 'capture', component: CaptureComponent },
	{ path: '**', redirectTo: '/', pathMatch: 'full' }
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent, MainComponent, CaptureComponent,
  ],
  imports: [
		BrowserModule, 
		RouterModule.forRoot(ROUTES),
		WebcamModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatMomentDateModule,
    FlexLayoutModule,
    HttpClientModule,
  ],
  providers: [ CameraService, ApiService, {provide: MAT_DATE_LOCALE, useValue: 'en-GB'} ],
  bootstrap: [AppComponent]
})
export class AppModule { }
