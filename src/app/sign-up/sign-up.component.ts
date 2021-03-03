import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';
import { MatDialogRef } from '@angular/material/dialog';
import { editProfileDialog } from '../profile/profile.component';
import { NotificationService } from '../services/toast.service';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

    signUpForm: FormGroup;
    id: number;
    url = '/api/newUser';
    users = [];

    pronouns = ['He/Him', 'She/Her', 'They/Them'];

    constructor(
        private fb: FormBuilder,
        public http: HttpClient,
        private notif: NotificationService
    ) { }



    ngOnInit(): void {
        this.signUpForm = this.fb.group({
            twitch: ['', [
                Validators.required,
                // Validators.pattern('^(?:https?:\/\/)?(?:www\.|go\.)?twitch\.tv\/([a-z0-9_]+)($|\?)'),
            ]],
            scoreSaber: [null, [
                // Validators.required
            ]],
            pronoun: ['He/Him', [
                Validators.required
            ]]
        });
    }

    async onSubmit() {
        try {
            await this.http.post(this.url, this.signUpForm.value).toPromise();
            this.notif.showSuccess('', 'Successfully created profile');
            window.location.href = '/';
        } catch (error) {
            console.error("Error: ", error);
            this.notif.showError('', 'Error creating profile');

            if (error.error?.message?.includes('ER_DUP_ENTRY')) this.notif.showError('', 'Discord or Scoresaber account already in use');
        }
    }

    submitData(): Observable<any> {
        return this.http.post(this.url, this.signUpForm.value);
    }

    get twitch() {
        return this.signUpForm.get('twitch');
    }

    get scoresaber() {
        return this.signUpForm.get('scoreSaber');
    }
}
