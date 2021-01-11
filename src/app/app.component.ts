import { Component, OnInit, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Title, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';

import { User } from './models/user.model'
import { Observable } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { NotificationService } from './services/toast.service';
import { MetaTagService } from './services/meta-tag.service';
import { UserAuthService } from './services/user-auth.service';
import { TournamentsComponent } from './tournaments/tournaments.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    title = 'BeatKhana!';

    user: User = null;
    updatedUser = false;

    discordSvg: SafeHtml;

    showDefault = true;

    public constructor(
        public titleService: Title,
        public http: HttpClient,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public sanitizer: DomSanitizer,
        public notif: NotificationService,
        public metaTags: MetaTagService,
        public cd: ChangeDetectorRef,
        protected userS: UserAuthService
    ) {
        router.events.subscribe(() => {
            this.burgerActive = false;
        });

        // if (this.constructor == AppComponent) {
        //     this.updateUser(); 
        // }
        if (!this.user) this.updateUser();

        router.events.forEach((event) => {
            if (event instanceof NavigationStart) {
                this.showDefault = !(event.url.includes('overlay') || event.url.includes('coordinator') || event.url.includes('/ta'));
            }
        });
    }

    ngOnInit(): void {
        this.metaTags.defineTags('/', 'BeatKhana!', 'The one stop spot for all Beat Saber tournament information', 'assets/images/icon/BeatKhana Logo RGB.png');
    }

    private async updateUser() {
        this.user = await this.userS.curUser();
    }

    public setTitle(newTitle: string) {
        this.titleService.setTitle(newTitle);
    }

    burgerActive = false;

    burgerClick() {
        this.burgerActive = !this.burgerActive;
    }
}
