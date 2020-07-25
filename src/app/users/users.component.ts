import { DataSource } from '@angular/cdk/table';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';
import { NotificationService } from '../services/toast.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent extends AppComponent implements OnInit {

    users = [];
    loading = true;

    columnsToDisplay = ['name', 'ssLink', 'twitch', 'globalRank', 'localRank', 'country', 'tourneyRank', 'TR', 'pronoun', 'roleNames', 'edit']
    dataSource: MatTableDataSource<any>;

    // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    // @ViewChild(MatSort, { static: true }) sort: MatSort;

    private paginator: MatPaginator;
    private sort: MatSort;

    @ViewChild(MatSort) set matSort(ms: MatSort) {
        this.sort = ms;
        this.setDataSourceAttributes();
    }

    @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
        this.paginator = mp;
        this.setDataSourceAttributes();
    }

    ngOnInit(): void {
        // this.dataSource = new MatTableDataSource();
        // this.setUsers();
        this.getUsers()
            .subscribe(data => {
                this.loading = false;
                this.users = data;
                this.dataSource = new MatTableDataSource(this.users);
                this.setDataSourceAttributes();
            });
        this.setTitle('All Users | BeatKhana!');
    }

    getUsers(): Observable<any> {
        return this.http.get('/api/users');
    }

    editUser(id) {
        const dialog = this.dialog.open(editUserDialog, {
            // height: '400px',
            minWidth: '60vw',
            maxHeight: '90vh',
            maxWidth: '95vw',
            data: {
                selUser: this.users.find(x => x.discordId == id),
                curUser: this.user
            }
        });

        dialog.afterClosed()
            .subscribe(data => {
                if (data) {
                    let i = this.users.findIndex(x => x.discordId == data.discordId);
                    this.users[i] = { ...this.users[i], ...data };
                    this.dataSource.data = this.users;
                }
            });
    }

    setDataSourceAttributes() {
        if (!this.loading) {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        }
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }
}

@Component({
    selector: 'editUserDialog',
    templateUrl: './editUserDialog.html',
    styleUrls: ['./users.component.scss']
})
export class editUserDialog implements OnInit {

    userForm: FormGroup;

    pronouns = ['He/Him', 'She/Her', 'They/Them'];

    userRoles = [
        {
            id: "1",
            name: 'Admin'
        },
        {
            id: "2",
            name: 'Staff'
        },
        {
            id: "3",
            name: 'Map Pool'
        },
        {
            id: "4",
            name: 'Coordinator'
        },
        {
            id: "5",
            name: 'Competitor'
        },
    ]

    constructor(
        private fb: FormBuilder,
        public http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<editUserDialog>,
        private notif: NotificationService
    ) { }

    roleIds = [];
    minRole = 999;

    ngOnInit() {
        this.userForm = this.fb.group({
            discordId: [this.data.selUser.discordId, [
                Validators.required
            ]],
            ssId: [this.data.selUser.ssId, [
                Validators.required
            ]],
            name: [this.data.selUser.name, [
                Validators.required
            ]],
            twitchName: [this.data.selUser.twitchName, [
                Validators.required
            ]],
            pronoun: [this.data.selUser.pronoun, [
                Validators.required
            ]],
            roleIds: this.fb.array([])
        });
        this.userForm.value.roleIds = [];
        this.roleIds = this.data.selUser.roleIds != null ? this.data.selUser.roleIds.split(', ').map(x=>+x) : [];
        this.minRole = Math.min(...this.data.curUser.roleIds.map(x=>+x));
    }

    onSubmit() {
        this.updateUser()
            .subscribe(data => {
                let returnData = this.userForm.value;
                if(this.userForm.value.roleIds.length == 0){
                    this.userForm.value.roleIds = this.data.selUser.roleIds;
                } else {
                    let roleNames = this.userForm.value.roleIds.map(x => this.userRoles[this.userRoles.findIndex(y=>y.id == x)].name).join(', ');
                    this.userForm.value.roleIds = this.userForm.value.roleIds.join(', ')
                    returnData = {...this.userForm.value, ...{roleNames: roleNames}};
                }
                if (!data.flag) {
                    this.notif.showSuccess('', 'Successfully updated user');
                } else {
                    console.error("Error: ", data.err);
                    this.notif.showError('', 'Error updating user');
                }
                this.dialogRef.close(returnData);
            }, error => {
                this.notif.showError('', 'Error updating user');
                console.error("Error: ", error);
                this.dialogRef.close(this.userForm.value);
            });
    }

    updateRoleId(roleId) {
        roleId = parseInt(roleId)
        var i = this.roleIds.indexOf(roleId);
        if (i === -1) {
            this.roleIds.push(roleId);
        } else {
            this.roleIds.splice(i, 1);
        }
        this.userForm.value.roleIds = this.roleIds;
        // console.log(this.roleIds)
    }

    updateUser(): Observable<any> {
        return this.http.put('/api/user/' + this.userForm.value.discordId, this.userForm.value);
    }
}