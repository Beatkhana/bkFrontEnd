import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

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

    constructor(
        private fb: FormBuilder,
        public http: HttpClient,
        private router: Router) { }

    ngOnInit(): void {
        this.signUpForm = this.fb.group({
            twitch: ['', [
                Validators.required,
                // Validators.pattern('^(?:https?:\/\/)?(?:www\.|go\.)?twitch\.tv\/([a-z0-9_]+)($|\?)')
            ]],
            scoreSaber: ['', [
                Validators.required
            ]]
        });
    }

    onSubmit() {
        console.log('good job');
        this.submitData()
            .subscribe(data => {
                console.log(data);
                window.location.href = '/';
            });
    }

    submitData(): Observable<any> {
        return this.http.post(this.url, this.signUpForm.value);
    }

    get twitch() {
        return this.signUpForm.get('twitch');
    }
}
