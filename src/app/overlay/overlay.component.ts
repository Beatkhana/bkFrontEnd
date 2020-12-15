import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { BracketComponent, updateMatchDialog } from '../bracket/bracket.component';
import { bracketMatch } from '../_models/bracket.model';

@Component({
    selector: 'app-overlay',
    templateUrl: './overlay.component.html',
    styleUrls: ['./overlay.component.scss']
})
export class OverlayComponent implements AfterViewInit {

    canvas;
    body = document.body;
    svgData;

    matchId: Number | string;
    stage: any;
    tourneyId: any;

    matchData: any;

    settings: any;
    viewSeason = '1';
    seasons: number[] = [];

    bracketData = [];
    intervalIteration = 0;

    constructor(private route: ActivatedRoute, private http: HttpClient, public dialog: MatDialog) { }

    myWebSocket: WebSocketSubject<any> = webSocket(`${location.protocol == 'http:' ? 'ws' : 'wss'}://` + location.host + '/api/ws');

    async ngAfterViewInit(): Promise<void> {
        this.canvas = document.getElementById("fakeCanvas");
        this.route.params.subscribe(params => {
            this.matchId = params['matchId'];
            this.stage = params['stage'];
            this.tourneyId = params['tourneyId'];
        });

        if (!(this.stage == 'bracket' && this.matchId == 'display')) {
            // await this.draw();
            // await this.getMatchData();
        } else {
            this.initSettings();
        }

        this.myWebSocket.subscribe(
            msg => {
                if(msg.bracketMatch) this.updateDrawnMatch(msg.bracketMatch);
            },
            err => console.log('err: ', err),
            () => console.log('complete')
        );

        // console.log(this.router.url)
    }

    async initSettings() {
        const matchesData: any = await this.http.get(`/api/tournament/${this.tourneyId}/bracket`).toPromise();
        this.bracketData = matchesData;

        if (matchesData.length > 0) BracketComponent.generateMatches(this.bracketData, this.intervalIteration);
        let matchElements = document.getElementsByClassName('match');
        for (let i = 0; i < matchElements.length; i++) {
            const element = matchElements[i];
            element.addEventListener("click", () => this.updateMatch(element.getAttribute('data-matchid')))
        }
        this.intervalIteration = 1;
    }

    updateMatch(id) {
        const dialog = this.dialog.open(updateMatchDialog, {
            minWidth: '60vw',
            width: '60vw',
            maxHeight: '90vh',
            maxWidth: '95vw',
            panelClass: 'matchPanel',
            data: { ...this.bracketData.find(x => x.id == id), isAuth: false }
        });
    }

    updateDrawnMatch(data: bracketMatch) {
        let matchElem = document.getElementById(data.id);
        // let tmpElement = {

        // }
        let index = this.bracketData.findIndex(x => x.id == data.id);
        this.bracketData[index] = { ...this.bracketData[index], ...data };
        matchElem.querySelector('.pName.p1').innerHTML = data.p1.name || data.p1.id;
        matchElem.querySelector('.pName.p2').innerHTML = data.p2.name || data.p2.id;
        if (data.status == 'in_progress') {
            (<SVGPathElement>matchElem.querySelector('.in_progress')).style.display = 'inline';
        } else {
            (<SVGPathElement>matchElem.querySelector('.in_progress')).style.display = 'none';
        }
        if (data.p1.score != data.p2.score && data.status == 'complete') {
            if (data.p1.score > data.p2.score) {
                matchElem.querySelector('.pScore.p1').classList.add('winner');
                matchElem.querySelector('.pScore.p2').classList.add('loser');
            } else {
                matchElem.querySelector('.pScore.p1').classList.add('loser');
                matchElem.querySelector('.pScore.p2').classList.add('winner');
            }
        }

        if (data.p1.score != 0 || (data.status == 'in_progress' || data.status == 'complete')) matchElem.querySelector('.pScore.p1').innerHTML = data.p1.score.toString();
        if (data.p2.score != 0 || (data.status == 'in_progress' || data.status == 'complete')) matchElem.querySelector('.pScore.p2').innerHTML = data.p2.score.toString();

        matchElem.querySelector('.img.p1').setAttribute('href', data.p1.avatar);
        matchElem.querySelector('.img.p2').setAttribute('href', data.p2.avatar);

        // if (data.p1.id && data.p2.id) {
        //     matchElem.classList.add('matchReady');
        //     matchElem.addEventListener("click", () => this.updateMatch(matchElem.getAttribute('data-matchid')));
        // }
    }
}
