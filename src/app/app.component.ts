import { Component, OnInit, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Title, DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
    updatedUser = false;

    discordSvg: SafeHtml;

    public constructor(
        public titleService: Title,
        public http: HttpClient,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public sanitizer: DomSanitizer,
        public notif: NotificationService,
        public metaTags: MetaTagService,
        public cd: ChangeDetectorRef
    ) {
        // console.log(this.user);
        // if (this.user == null) {
        //     this.updateUser();
        // }

        router.events.subscribe(() => {
            this.burgerActive = false;
            this.updateUser();
        });

        setInterval(()=> {
            this.updatedUser = false;
        },30000);

        // route.params.subscribe(val => {
        //     this.updateUser();
        // });
        
        // console.log(this.discordSvg);
        // console.log(discordLogo);
        // this.getSVG()
        // this.discordSvg = this.sanitizer.bypassSecurityTrustHtml(discordLogo);
    }

    ngOnInit(): void {
        this.metaTags.defineTags('/', 'BeatKhana!', 'The one stop spot for all Beat Saber tournament information', 'assets/images/icon/BeatKhana Logo RGB.png');
    }

    // async getSVG() {
    //     const headers = new HttpHeaders();
    //     headers.set('Accept', 'image/svg+xml');
    //     const svgString =
    //         await this.http.get(`/assets/icons/discord.svg`, { headers, responseType: 'text' }).toPromise();
    //     console.log(svgString)
    //     this.discordSvg = this.sanitizer.bypassSecurityTrustHtml(svgString);
    // }

    updateUser() {
        if(!this.updatedUser){
            this.updatedUser = true;
            this.logIn()
                .subscribe(data => {
                    if (data) {
                        this.user = data[0];
                    }else {
                        this.user = null;
                    }
                    this.cd.detectChanges();
                });
        }
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
