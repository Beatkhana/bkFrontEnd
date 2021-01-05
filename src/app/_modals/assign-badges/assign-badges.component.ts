import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/toast.service';
import { editUserDialog } from 'src/app/users/users.component';
import { badge } from 'src/app/_models/badge.model';
import { userAPI } from 'src/app/_models/user.model';

@Component({
    selector: 'app-assign-badges',
    templateUrl: './assign-badges.component.html',
    styleUrls: ['./assign-badges.component.scss']
})
export class AssignBadgesComponent implements OnInit {

    constructor(
        private fb: FormBuilder,
        public http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: {user: userAPI},
        private dialogRef: MatDialogRef<editUserDialog>,
        private notif: NotificationService
    ) { }

    badges: badge[];
    badgeIds = [];

    btnDisabled = false;

    async ngOnInit() {
        this.badges = <badge[]>await this.http.get(`/api/badges`).toPromise();
        this.badgeIds = this.data.user.badges.map(x => x.id);
    }

    updateBadge(id) {
        let index = this.badgeIds.indexOf(id);
        if (index > -1) {
            this.badgeIds.splice(index, 1)
        } else {
            this.badgeIds.push(id);
        }
    }

    async onSubmit() {
        this.btnDisabled = true;
        try {
            await this.http.put(`/api/user/${this.data.user.discordId}/badges`, this.badgeIds).toPromise();
            this.notif.showSuccess('', 'Successfully Updated Badges');
            this.dialogRef.close(true);
        } catch (error) {
            this.notif.showError('', 'Error Updating Badges');
            this.dialogRef.close(false);
        }
    }

}
