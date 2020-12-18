import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-form',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // Form related variables
  form:FormGroup
  hide:boolean = true // hide password
  errorMessage = ''

  constructor(private fb:FormBuilder, private apiSvc:ApiService, private router:Router) { }

  ngOnInit(): void {
    this.createForm();
  }

  // Handles the form when submit button is clicked
  async onSubmit() {
    try {
      this.errorMessage = ''
      await this.apiSvc.apiLogin(this.form.value)
      this.router.navigate(['/main'])
    } catch (e) {
      this.errorMessage = e.error.msg;
      console.log("Authentication error:", e.error.msg)
    }
  }

/* -------------------------------------------------------------------------- */
//                    ######## PRIVATE FUNCTIONS ########
/* -------------------------------------------------------------------------- */

  // Generates the form
  private createForm () {
    this.form = this.fb.group({
      user_id: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required]),
    })
  }
}