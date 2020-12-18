import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import {CameraService} from '../camera.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
	form:FormGroup
	imagePath = '/assets/cactus.png'

	constructor(private cameraSvc: CameraService, private fb: FormBuilder, private apiSvc: ApiService, private router:Router) { }

	ngOnInit(): void {
		// Redirect back to landingpage is credentials not found
		if (!!!this.apiSvc.getCredentials()) {
			this.router.navigate(['/'])
			console.error("Error 401 (Unauthorized) Please re-login.")
		}
		this.createForm()
		if (this.cameraSvc.hasImage()) {
			const img = this.cameraSvc.getImage()
			this.imagePath = img.imageAsDataUrl
		}
	}

	async onSubmit () {
		try {
			const id = await this.apiSvc.apiUpload(this.form.value, this.cameraSvc.getImage())
			console.info("Id is: ",id)
			this.clear()
		} catch (e) {
			console.error("Error posting data:", e.error.msg)
			this.router.navigate(['/'])
		}
	}

	clear() {
		this.imagePath = '/assets/cactus.png'
		this.createForm()
	}

/* -------------------------------------------------------------------------- */
//                    ######## PRIVATE FUNCTIONS ########
/* -------------------------------------------------------------------------- */

  // Generates the form
  private createForm () {
    this.form = this.fb.group({
      title: this.fb.control('', [Validators.required]),
      comments: this.fb.control('', [Validators.required]),
    })
  }

}
