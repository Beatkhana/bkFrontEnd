import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';
import { NotificationService } from '../services/toast.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends AppComponent implements OnInit {

    title = "Profile | BeatKhana!";
    private url = '/api/rankings';
    loading = true;

    ngOnInit(): void {
        this.setTitle(this.title);
        // if(this.user.avatar.includes('api') || this.user.avatar.includes('oculus')) {
        //     this.user.avatar = "https://new.scoresaber.com" + this.user.avatar;
        // } else {
        //     this.user.avatar = `/${this.user.avatar}` + (this.user.avatar.substring(0, 2) == 'a_' ? '.gif' : '.webp');
        //     this.user.avatar = `https://cdn.discordapp.com/avatars/${this.user.discordId}${ this.user.avatar }`
        // }
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
                    this.user = {...this.user, ...data};
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

    onSubmit() {
        this.updateUser()
            .subscribe(data => {
                let returnData = this.userForm.value;
                // if(this.userForm.value.roleIds.length == 0){
                //     this.userForm.value.roleIds = this.data.selUser.roleIds;
                // } else {
                //     let roleNames = this.userForm.value.roleIds.map(x => this.userRoles[this.userRoles.findIndex(y=>y.id == x)].name).join(', ');
                //     this.userForm.value.roleIds = this.userForm.value.roleIds.join(', ')
                //     returnData = {...this.userForm.value, ...{roleNames: roleNames}};
                // }
                if (!data.flag) {
                    this.notif.showSuccess('', 'Successfully updated profile');
                } else {
                    console.error("Error: ", data.err);
                    this.notif.showError('', 'Error updating profile');
                }
                this.dialogRef.close(returnData);
            }, error => {
                this.notif.showError('', 'Error updating profile');
                console.error("Error: ", error);
                this.dialogRef.close(this.userForm.value);
            });
    }

    // updateRoleId(roleId) {
    //     roleId = parseInt(roleId)
    //     var i = this.roleIds.indexOf(roleId);
    //     if (i === -1) {
    //         this.roleIds.push(roleId);
    //     } else {
    //         this.roleIds.splice(i, 1);
    //     }
    //     this.userForm.value.roleIds = this.roleIds;
    //     // console.log(this.roleIds)
    // }

    updateUser(): Observable<any> {
        return this.http.put('/api/user/' + this.userForm.value.discordId, this.userForm.value);
    }
}
