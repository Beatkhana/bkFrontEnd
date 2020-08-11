import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent extends AppComponent implements OnInit {

    title = " | BeatKhana!";
    private url = '/api/user/';
    userId: string;
    public curUser = null;
    loading = true;

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.userId = params.get('id');
            this.url += this.userId;
            this.getUser()
                .subscribe( data => {
                    this.curUser = data[0];

                    this.curUser.tournaments = this.curUser.tournaments.split(', ');
                    
                    // console.log(this.curUser)
                    this.setTitle(this.curUser.name+"'s Profile" + this.title);
                });
        });
    }

    getUser(): Observable<any> {
        return this.http.get(this.url);
    }

}
