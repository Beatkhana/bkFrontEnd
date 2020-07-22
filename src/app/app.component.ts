import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { User } from './models/user.model'
import { Observable } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { NotificationService } from './services/toast.service';
import { MetaTagService } from './services/meta-tag.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    title = 'BeatKhana!';

    user: User = null;

    public constructor(
        public titleService: Title,
        public http: HttpClient,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public sanitizer: DomSanitizer,
        public notif: NotificationService,
        public metaTags: MetaTagService
    ) {
        // console.log(this.user);
        if (this.user == null) {
            this.updateUser();
        }

        router.events.subscribe(() => {
            this.burgerActive = false;
        });

        route.params.subscribe(val => {
            this.updateUser;
        });
    }

    ngOnInit(): void {
        this.metaTags.defineTags('/','BeatKhana!','The one stop spot for all Beat Saber tournament information','assets/images/icon/BeatKhana Logo RGB.png');
    }

    updateUser() {
        this.logIn()
            .subscribe(data => {
                if (data) {
                    this.user = data[0];
                }
            });
    }

    public logIn(): Observable<User[]> {
        return this.http.get<User[]>('/api/user');
    }

    public setTitle(newTitle: string) {
        this.titleService.setTitle(newTitle);
    }

    burgerActive = false;

    burgerClick() {
        this.burgerActive = !this.burgerActive;
    }
}
