import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';
import {Subject} from 'rxjs';
import { ApiService } from '../api.service';
import {CameraService} from '../camera.service';
import {CameraImage} from '../models';

@Component({
  selector: 'app-capture',
  templateUrl: './capture.component.html',
  styleUrls: ['./capture.component.css']
})
export class CaptureComponent implements OnInit {

	allowCameraSwitch = true
	videoOptions: MediaTrackConstraints = {
		//width: 1024,
		//height: 576
	}
	webcams: MediaDeviceInfo[] = []
	currWebcam = 0

	trigger = new Subject<void>()
	switchCamera = new Subject<boolean | string>()

	constructor(private router: Router, private cameraSvc: CameraService, private apiSvc:ApiService) { }

	ngOnInit(): void {
		// Redirect back to landingpage is credentials not found
		if (!!!this.apiSvc.getCredentials()) {
			this.router.navigate(['/'])
			console.error("Error 401 (Unauthorized) Please re-login.")
		}
		WebcamUtil.getAvailableVideoInputs()
			.then(devs => this.webcams = devs)
	}

	triggerSnapshot() {
		this.trigger.next()
	}

	switchToNextCamera() {
		this.currWebcam = (this.currWebcam + 1) % this.webcams.length
		this.switchCamera.next(this.webcams[this.currWebcam].deviceId)
	}

	handleImage(img: WebcamImage) {
		fetch(img.imageAsDataUrl)
			.then(res => res.blob())
			.then(blob => {
				this.cameraSvc.image = {
					imageAsDataUrl: img.imageAsDataUrl,
					imageData: blob
				} as CameraImage
				this.router.navigate([ '/main' ])
			})
	}

	handleError(err: WebcamInitError) {
		console.error('>>> webcam error: ', err)
	}

	back() {
		this.cameraSvc.clear()
		this.router.navigate([ '/main' ])
	}
}
