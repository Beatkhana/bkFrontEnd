import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { Observable } from 'rxjs';
import { AssignBadgesComponent } from '../_modals/assign-badges/assign-badges.component';
import { userAPI } from '../_models/user.model';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent extends AppComponent implements OnInit {

    title = " | BeatKhana!";
    private url = '/api/user/';
    userId: string;
    public curUser: userAPI = null;
    loading = true;

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.userId = params.get('id');
            this.url += this.userId;
            this.getUser()
                .subscribe( data => {
                    this.curUser = data;
                    this.setTitle(this.curUser.name+"'s Profile" + this.title);
                    if(this.curUser.avatar.includes('api') || this.curUser.avatar.includes('oculus')) {
                        this.curUser.avatar = "https://new.scoresaber.com" + this.curUser.avatar;
                    } else {
                        this.curUser.avatar = `/${this.curUser.avatar}` + (this.curUser.avatar.substring(0, 2) == 'a_' ? '.gif' : '.webp');
                        this.curUser.avatar = `https://cdn.discordapp.com/avatars/${this.curUser.discordId}${ this.curUser.avatar }`
                    }
                });
        });
    }

    getUser(): Observable<any> {
        return this.http.get(this.url);
    }

    editBadges() {
        const dialog = this.dialog.open(AssignBadgesComponent, {
            minWidth: '60vw',
            maxHeight: '90vh',
            maxWidth: '95vw',
            data: {
                user: this.curUser,
            }
        });

        dialog.afterClosed()
            .subscribe(async data => {
                if (data) {
                    this.curUser = <userAPI>await this.http.get(this.url).toPromise();
                }
            });
    }

}
