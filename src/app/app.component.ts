import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { User } from './models/user.model'
import { Observable } from 'rxjs';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'BeatKhana!';

    user: User;

    public constructor(
        public titleService: Title,
        public http: HttpClient,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog
    ) {
        this.logIn()
            .subscribe(data => {
                if(data){
                    this.user = data[0];
                    console.log(data);
                }
            });
    }

    ngOnInit(): void {

    }

    public logIn(): Observable<User[]> {
        // console.log('/api/discordAuth?code=' + code);
        return this.http.get<User[]>('/api/user');
    }

    public setTitle(newTitle: string) {
        this.titleService.setTitle(newTitle);
    }
}
