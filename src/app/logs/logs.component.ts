import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { AppComponent } from '../app.component';

@Component({
    selector: 'app-logs',
    templateUrl: './logs.component.html',
    styleUrls: ['./logs.component.scss']
})
export class LogsComponent extends AppComponent implements AfterViewInit {

    loading = true;
    logs = [];

    resultsLength = 18;
    isLoadingResults = true;

    columnsToDisplay = ['user', 'log', 'time'];

    dataSource: MatTableDataSource<any>;

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    ngAfterViewInit(): void {
        this.getLogs()
            .subscribe(data => {
                this.loading = false;
                data.data.sort((a, b) => {
                    return <any>new Date(a.time) - <any>new Date(b.time);
                });
                this.logs = data.data;
            });

        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.isLoadingResults = true;
                    return this.getLogs(this.paginator.pageIndex);
                    // return this.exampleDatabase!.getRepoIssues(
                    //     this.sort.active, this.sort.direction, this.paginator.pageIndex);
                }),
                map(data => {
                    // Flip flag to show that loading has finished.
                    this.isLoadingResults = false;
                    // this.isRateLimitReached = false;
                    this.resultsLength = data.total;

                    return data.data;
                }),
                catchError(() => {
                    this.isLoadingResults = false;
                    // Catch if the GitHub API has reached its rate limit. Return empty data.
                    // this.isRateLimitReached = true;
                    return observableOf([]);
                })
            ).subscribe(data => {
                this.logs = data
            });
    }

    getLogs(page = 0): Observable<any> {
        return this.http.get('/api/logs?page=' + page);
    }

}
