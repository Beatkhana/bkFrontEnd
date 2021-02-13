import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';
import { NotificationService } from '../services/toast.service';
import { userAPI } from '../_models/user.model';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends AppComponent implements OnInit {

    title = "Profile | BeatKhana!";
    loading = true;
    curUser: userAPI = null;

    async ngOnInit(): Promise<void> {
        this.setTitle(this.title);

        await this.updateUser();
        this.curUser = await this.http.get<userAPI>(`/api/user/${this.user.discordId}`).toPromise();
        // this.setTitle(this.curUser.name+"'s Profile" + this.title);
        if (this.curUser.avatar.includes('api') || this.curUser.avatar.includes('oculus')) {
            this.curUser.avatar = "https://new.scoresaber.com" + this.curUser.avatar;
        } else {
            this.curUser.avatar = `/${this.curUser.avatar}` + (this.curUser.avatar.substring(0, 2) == 'a_' ? '.gif' : '.webp');
            this.curUser.avatar = `https://cdn.discordapp.com/avatars/${this.curUser.discordId}${this.curUser.avatar}`
        }
        console.log(this.user);
    }

    editUser(id) {
        const dialog = this.dialog.open(editProfileDialog, {
            // height: '400px',
            minWidth: '60vw',
            maxHeight: '90vh',
            maxWidth: '95vw',
            data: {
                selUser: this.user,
            }
        });

        dialog.afterClosed()
            .subscribe(data => {
                if (data) {
                    // let i = this.users.findIndex(x => x.discordId == data.discordId);
                    // this.users[i] = { ...this.users[i], ...data };
                    // this.dataSource.data = this.users;
                    this.user = { ...this.user, ...data };
                }
            });
    }

}

@Component({
    selector: 'editProfileDialog',
    templateUrl: './editProfileDialog.html',
    styleUrls: ['./profile.component.scss']
})
export class editProfileDialog implements OnInit {

    userForm: FormGroup;

    pronouns = ['He/Him', 'She/Her', 'They/Them'];

    constructor(
        private fb: FormBuilder,
        public http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<editProfileDialog>,
        private notif: NotificationService
    ) { }

    // roleIds = [];
    // minRole = 999;

    ngOnInit() {
        this.userForm = this.fb.group({
            discordId: [this.data.selUser.discordId, [
                Validators.required
            ]],
            // ssId: [this.data.selUser.ssId, [
            //     Validators.required
            // ]],
            name: [this.data.selUser.name, [
                Validators.required
            ]],
            twitchName: [this.data.selUser.twitchName, [
                Validators.required
            ]],
            pronoun: [this.data.selUser.pronoun, [
                Validators.required
            ]]
        });
        this.userForm.value.roleIds = [];
        // this.roleIds = this.data.selUser.roleIds != null ? this.data.selUser.roleIds.split(', ').map(x=>+x) : [];
        // this.minRole = Math.min(...this.data.curUser.roleIds.map(x=>+x));
    }

    async onSubmit() {
        try {
            await this.http.put('/api/user/' + this.userForm.value.discordId, this.userForm.value).toPromise();
            this.notif.showSuccess('', 'Successfully updated profile');
            this.dialogRef.close(this.userForm.value);
        } catch (error) {
            console.error("Error: ", error);
            this.notif.showError('', 'Error updating profile');
            this.dialogRef.close(false);
        }
    }

    updateUser(): Observable<any> {
        return this.http.put('/api/user/' + this.userForm.value.discordId, this.userForm.value);
    }
}
