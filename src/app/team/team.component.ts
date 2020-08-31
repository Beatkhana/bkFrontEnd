import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';

@Component({
    selector: 'app-team',
    templateUrl: './team.component.html',
    styleUrls: ['./team.component.scss']
})
export class TeamComponent extends AppComponent implements OnInit {

    title = "Team | BeatKhana!";
    private url = '/api/team';
    userId: string;
    public team = null;
    loading = true;

    displayRoles = {
        1: {label: 'Admins', id: 1, users: []},
        2: {label: 'Staff', id: 2, users: []},
        6: {label: 'Mini Tournament Team', id: 6, users: []},
    }

    ngOnInit(): void {
        this.setTitle(this.title);
        this.getTeam()
            .subscribe(data => {
                this.team = data;
                for (let member of this.team) {
                    if(member.avatar.includes('api') || member.avatar.includes('oculus')) {
                        member.avatar = "https://new.scoresaber.com" + member.avatar;
                    } else {
                        member.avatar = `/${member.avatar}` + (member.avatar.substring(0, 2) == 'a_' ? '.gif' : '.webp');
                        member.avatar = `https://cdn.discordapp.com/avatars/${member.discordId}${ member.avatar }`
                    }
                    let minRole = Math.min.apply(null, member.roleIds);
                    this.displayRoles[minRole].users.push(member);
                }
            });
    }

    getTeam(): Observable<any> {
        return this.http.get(this.url);
    }

}
