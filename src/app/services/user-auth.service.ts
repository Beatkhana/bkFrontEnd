import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITournament } from '../models/tournament';
import { IUser } from '../models/user';

@Injectable({
    providedIn: 'root',
})
export class UserAuthService {
    user: IUser.User;
    request: Promise<IUser.User> = null;

    constructor(public http: HttpClient) {
        this.getUser();
    }

    private async getUser() {
        try {
            this.request = this.http.get<IUser.User>('/api/user').toPromise();
            let tmp = await this.request;
            this.user = tmp ? tmp : null;
            if (this.user) {
                if (
                    this.user.avatar.includes('api') ||
                    this.user.avatar.includes('oculus')
                ) {
                    this.user.avatar =
                        'https://new.scoresaber.com' + this.user.avatar;
                } else {
                    this.user.avatar =
                        `/${this.user.avatar}` +
                        (this.user.avatar.substring(0, 2) == 'a_'
                            ? '.gif'
                            : '.webp');
                    this.user.avatar = `https://cdn.discordapp.com/avatars/${this.user.discordId}${this.user.avatar}`;
                }
            }
            this.request = null;
        } catch (error) {
            this.request = null;
            this.user = null;
            console.error(error);
        }
    }

    async curUser() {
        if (this.request) {
            await this.request;
            return this.user;
        } else {
            return this.user;
        }
    }

    hasAdminPerms(tournament: ITournament.Tournament) {
        if (!this.user) return false;
        return (
            tournament.owner == this.user.discordId ||
            this.user.roles.find((x) => x.roleId === 1)
        );
    }
}
