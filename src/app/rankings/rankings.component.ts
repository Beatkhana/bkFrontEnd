import { Component, HostListener, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-rankings',
    templateUrl: './rankings.component.html',
    styleUrls: ['./rankings.component.scss']
})
export class RankingsComponent extends AppComponent implements OnInit {

    title = "Rankings | BeatKhana!";
    private url = '/api/rankings';
    public users = [];
    loading = true;
    secondLoading = false;
    allRecords = false;
    page = 0;

    ngOnInit(): void {
        this.getRanks()
            .subscribe(data => {
                this.page += 1;
                this.users = data.data;
                for (const member of this.users) {
                    if(member.avatar.includes('api') || member.avatar.includes('oculus')) {
                        member.avatar = "https://new.scoresaber.com" + member.avatar;
                    } else {
                        member.avatar = `/${member.avatar}` + (member.avatar.substring(0, 2) == 'a_' ? '.gif' : '.webp');
                        member.avatar = `https://cdn.discordapp.com/avatars/${member.discordId}${ member.avatar }`
                    }
                }
                this.loading = false;
                // console.log(data)
            });
        this.setTitle(this.title);
    }

    public getRanks(): Observable<any> {
        return this.http.get(this.url + `?page=${this.page}`);
    }

    @HostListener('window:scroll', ['$event'])
    doSomething(event) {
        if (window.pageYOffset - document.getElementsByClassName("playerGrid")[0].scrollHeight > -1000 && !this.secondLoading && !this.allRecords) {
            this.secondLoading = true
            this.getRanks()
            .subscribe(data => {
                if(data.err == null) {
                    this.page += 1;
                    this.users = this.users.concat(data.data);
                    this.secondLoading = false;
                }else {
                    this.secondLoading = false;
                    this.allRecords = true;
                }
            });
        }
    }

}
