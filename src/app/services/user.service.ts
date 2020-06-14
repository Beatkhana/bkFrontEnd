import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export class userAuth {

    user: User;

    constructor(public http: HttpClient) {
        this.logIn()
            .subscribe(data => {
                this.user = data[0];
                console.log(data[0]);
            });
    }

    public logIn(): Observable<User[]> {
        return this.http.get<User[]>('/api/user');
    }

    public getUser() {
        return this.user;
    }
}