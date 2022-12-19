import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    RouterStateSnapshot,
    UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IUser } from '../models/user';

@Injectable({
    providedIn: 'root',
})
export class AuthGuardGuard implements CanActivate {
    constructor(public http: HttpClient) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ):
        | Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree>
        | boolean
        | UrlTree {
        return this.http.get<IUser.User>('/api/user').pipe(
            map((data) => {
                return !!data.roles.find(
                    (x) => x.roleId === 1 || x.roleId === 2
                );
            })
        );
    }
}
