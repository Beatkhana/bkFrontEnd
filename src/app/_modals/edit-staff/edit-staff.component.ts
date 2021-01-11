import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/toast.service';
import { editUserDialog } from 'src/app/users/users.component';
import { role, staff } from 'src/app/_models/tournamentApi.model';
import { userAPI } from 'src/app/_models/user.model';

@Component({
    selector: 'app-edit-staff',
    templateUrl: './edit-staff.component.html',
    styleUrls: ['./edit-staff.component.scss']
})
export class EditStaffComponent implements OnInit {

    roles: role[] = [{
        id: 1,
        role: "Admin"
    }, {
        id: 2,
        role: "Map Pool"
    }, {
        id: 3,
        role: "Coordinator"
    }];

    users: userAPI[];


    constructor(
        private fb: FormBuilder,
        public http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: { tournament: any, staff: staff[] },
        private dialogRef: MatDialogRef<editUserDialog>,
        private notif: NotificationService
    ) { }

    async ngOnInit(): Promise<void> {
        this.users = await this.http.get<userAPI[]>('/api/users').toPromise();
        for (const staff of this.data.staff) {
            this.users.splice(this.users.findIndex(x => x.discordId == staff.discordId), 1);
        }
    }

    checkRole(roleId: number, roles: role[]) {
        return roles.map(x => x.id).includes(roleId);
    }

    updateRoles(user: staff, role: role) {
        let userIndex = this.data.staff.findIndex(x => x.discordId == user.discordId);
        let roleIndex = this.data.staff[userIndex].roles.findIndex(x => x.id == role.id);
        if (roleIndex > -1) {
            this.data.staff[userIndex].roles.splice(roleIndex, 1);
        } else {
            this.data.staff[userIndex].roles.push(role);
        }
    }

    async update() {
        let postData = this.data.staff.map(x => {
            return {
                userId: x.discordId,
                roleIds: x.roles.map(x => x.id)
            }
        });
        try {
            await this.http.post(`/api/tournament/${this.data.tournament.tournamentId}/staff`, { users: postData}).toPromise();
            this.notif.showSuccess("", "Successfully Updated Staff");
            this.dialogRef.close(true);
        } catch (error) {
            this.notif.showError("", "Error Updating Staff");
            this.dialogRef.close(false);
        }
    }

    filteredOptions: any;

    updatePlayers(event) {
        let usrIndex = this.users.findIndex(x => x.discordId == event.option.value);
        if (usrIndex > -1) {
            let tmp = <any>this.users[usrIndex];
            tmp.roles = [];
            this.data.staff.push(tmp);
            this.users.splice(usrIndex, 1);
            this.filteredOptions = this.users;
        }
    }

    lastVal = "";

    updateLastEvent(event) {
        this.lastVal = event;
    }

    updateFilter($val) {
        this.filteredOptions = this._filter($val);
    }

    private _filter(name: string) {
        const filterValue = name.toLowerCase();
        return this.users.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
    }

    displayFn(id): string {
        let user = this.users.find(x => x.discordId == id);
        return user && user.name ? user.name : '';
    }

}
