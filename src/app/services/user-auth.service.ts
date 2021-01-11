import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserAuthService {

    user: User;
    request: Promise<User[]> = null;

    constructor(public http: HttpClient) {
        this.getUser();
    }

    private async getUser() {
        this.request = this.http.get<User[]>('/api/user').toPromise();
        let tmp = await this.request;
        this.user = tmp ? tmp[0] : null;
        if (this.user) {
            if(this.user.avatar.includes('api') || this.user.avatar.includes('oculus')) {
                this.user.avatar = "https://new.scoresaber.com" + this.user.avatar;
            } else {
                this.user.avatar = `/${this.user.avatar}` + (this.user.avatar.substring(0, 2) == 'a_' ? '.gif' : '.webp');
                this.user.avatar = `https://cdn.discordapp.com/avatars/${this.user.discordId}${ this.user.avatar }`
            }
        }
        this.request = null;
    }

    async curUser() {
        if (this.request) {
            await this.request;
            return this.user;
        } else {
            return this.user;
        }        
    }

    hasAdminPerms(tournament) {
        if (!this.user) return false;
        return (tournament.owner == this.user.discordId || this.user.roleIds.includes("1"));
    }
}
