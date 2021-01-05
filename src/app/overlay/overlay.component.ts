import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { BracketComponent, updateMatchDialog } from '../bracket/bracket.component';
import { bracketMatch } from '../_models/bracket.model';
import { TAEvent, EventType } from '../_models/ta/event';
import { PacketType, ForwardingPacket } from '../_models/ta/forwardingPacket';
import { Player } from '../_models/ta/player';

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

    bkWS: WebSocketSubject<any> = webSocket(`${location.protocol == 'http:' ? 'ws' : 'wss'}://` + location.host + '/api/ws');
    taWS: WebSocketSubject<any>;

    async ngAfterViewInit(): Promise<void> {
        this.canvas = document.getElementById("fakeCanvas");
        this.route.params.subscribe(params => {
            this.matchId = params['matchId'];
            this.stage = params['stage'];
            this.tourneyId = params['tourneyId'];
        });

        if (!(this.stage == 'bracket' && this.matchId == 'display')) {
            await this.getMatchData();
            // await this.draw();
            // await this.getMatchData();
        } else {
            this.initDisplaySettings();
        }

        this.bkWS.subscribe(
            msg => {
                if (msg.bracketMatch && (this.stage == 'bracket' && this.matchId == 'display')) this.updateDrawnMatch(msg.bracketMatch);
                if (msg.bracketMatch && !(this.stage == 'bracket' && this.matchId == 'display') && this.matchData?.id == msg.bracketMatch.id) this.updateDisplayMatch(msg.bracketMatch);
            },
            err => console.log('err: ', err),
            () => console.log('complete')
        );

        // console.log(this.router.url)
    }

    async draw(url: string) {
        await fetch(url)
            .then(r => r.text())
            .then(text => {
                this.canvas.innerHTML = text;
                // this.svgData = text;
            })
            .catch(console.error.bind(console));
    }

    handlePacket(packet) {
        if (!this.matchData) return;
        // console.log(packet);
        if (packet.Type == PacketType.ForwardingPacket) {
            let forward: ForwardingPacket = packet.SpecificPacket;
            if (forward.Type == PacketType.Event) {
                let event: TAEvent = forward.SpecificPacket;
                // console.log(event);
                if (event.Type == EventType.PlayerUpdated) {
                    let playerInfo: Player = event.ChangedObject;
                    // console.log(playerInfo, this.matchData);
                    console.log(playerInfo.UserId == this.matchData.p1.ssId || playerInfo.UserId == this.matchData.p2.ssId)
                    if (!(playerInfo.UserId == this.matchData.p1.ssId || playerInfo.UserId == this.matchData.p2.ssId)) return;

                    let curPlayer = this.matchData.p1.ssId == playerInfo.UserId ? this.matchData.p1 : this.matchData.p2;

                    this.animateValue(playerInfo, "Score", curPlayer.soreInfo?.Score, playerInfo.Score, 500);
                    this.animateValue(
                        playerInfo,
                        "Accuracy",
                        curPlayer.soreInfo?.Accuracy,
                        playerInfo.Accuracy,
                        500
                    );
                    this.animateValue(playerInfo, "Combo", curPlayer.soreInfo?.Combo, playerInfo.Combo, 500);
                }
            }
        }
    }

    animateValue(player: Player, property, start = 0, end, duration) {
        // console.log
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min(
                (timestamp - startTimestamp) / duration,
                1
            );
            if (property == "Accuracy") {
                player[property] = progress * (end - start) + start;
            } else {
                player[property] = Math.floor(progress * (end - start) + start);
            }

            if (player.UserId == this.matchData.p1.ssId) this.matchData.p1.soreInfo = player;
            if (player.UserId == this.matchData.p2.ssId) this.matchData.p2.soreInfo = player;
            this.scoreUpdate();


            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    scoreUpdate() {
        console.log(this.matchData);
        if (this.matchData.p1.soreInfo) {
            let scoreInfo: Player = this.matchData.p1.soreInfo;
            setTimeout(() => {
                let liveScore = document.getElementById("p1LiveScore");
                let liveAcc = document.getElementById("p1LiveAcc");
                let liveCombo = document.getElementById("p1LiveCombo");
                if (liveScore) liveScore.children[0].innerHTML = scoreInfo.Score.toString(), liveScore.style.display = "block";
                if (liveAcc) liveAcc.children[0].innerHTML = (Math.round((+scoreInfo.Accuracy + Number.EPSILON) * 10000) / 100).toString(), liveAcc.style.display = "block";
                if (liveCombo) liveCombo.children[0].innerHTML = scoreInfo.Combo.toString(), liveCombo.style.display = "block";
            }, scoreInfo.StreamDelayMs);
        }
        if (this.matchData.p2.soreInfo) {
            let scoreInfo: Player = this.matchData.p2.soreInfo;
            setTimeout(() => {
                let liveScore = document.getElementById("p2LiveScore");
                let liveAcc = document.getElementById("p2LiveAcc");
                let liveCombo = document.getElementById("p2LiveCombo");
                if (liveScore) liveScore.children[0].innerHTML = scoreInfo.Score.toString(), liveScore.style.display = "block";
                if (liveAcc) liveAcc.children[0].innerHTML = (Math.round((+scoreInfo.Accuracy + Number.EPSILON) * 10000) / 100).toString(), liveAcc.style.display = "block";
                if (liveCombo) liveCombo.children[0].innerHTML = scoreInfo.Combo.toString(), liveCombo.style.display = "block";
            }, scoreInfo.StreamDelayMs);
        }
    }

    async getMatchData() {
        let data: any = await this.http.get(`/api/tournament/${this.tourneyId}/${this.stage}/${this.matchId}`).toPromise();
        let settings: any = await this.http.get(`/api/tournament/${this.tourneyId}`).toPromise();
        settings = settings[0];
        if (settings.ta_url) {
            this.taWS = webSocket(`wss://` + settings.ta_url);
            this.taWS.subscribe(
                msg => {
                    this.handlePacket(msg)
                },
                err => console.log('err: ', err),
                () => console.log('complete')
            );
        }
        this.matchData = data;
        console.log(data);
        console.log(settings);
        await this.draw(`/assets/overlay/${data.tournamentId}.svg?t=${Date.now()}`);

        if (data.p1) {
            document.getElementById('p1Name').children[0].innerHTML = data.p1.name;
            document.getElementById('p1Flag')?.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `/assets/flags/${data.p1.country.toUpperCase()}.png`);
            document.getElementById('p2Name').children[0].innerHTML = data.p2.name;
            document.getElementById('p2Flag')?.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `/assets/flags/${data.p2.country.toUpperCase()}.png`);
            let pointIcons = document.querySelectorAll('[id*="Score"]');
            for (let i = 0; i < pointIcons.length; i++) {
                const point = pointIcons[i];
                (<HTMLElement>point).style.display = "none";
                // point.setAttribute("style", "display:none");
            }
            for (let i = 0; i < Math.ceil(data.best_of / 2); i++) {
                if (document.getElementById(`p1Score_${i + 1}_blank`)) document.getElementById(`p1Score_${i + 1}_blank`).style.display = "block";
                if (document.getElementById(`p2Score_${i + 1}_blank`)) document.getElementById(`p2Score_${i + 1}_blank`).style.display = "block";
            }
            for (let i = 0; i < data.p1.score; i++) {
                if (document.getElementById(`p1Score_${i + 1}_blank`)) document.getElementById(`p1Score_${i + 1}_blank`).style.display = "none";
                if (document.getElementById(`p1Score_${i + 1}`)) document.getElementById(`p1Score_${i + 1}`).style.display = "block";
            }
            for (let i = 0; i < data.p2.score; i++) {
                if (document.getElementById(`p2Score_${i + 1}_blank`)) document.getElementById(`p2Score_${i + 1}_blank`).style.display = "none";
                if (document.getElementById(`p2Score_${i + 1}`)) document.getElementById(`p2Score_${i + 1}`).style.display = "block";
            }
        }
    }

    async initDisplaySettings() {
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

    updateDisplayMatch(match) {
        this.matchData = match;
        if (this.matchData.p1) {
            document.getElementById('p1Name').children[0].innerHTML = this.matchData.p1.name;
            document.getElementById('p1Flag')?.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `/assets/flags/${this.matchData.p1.country.toUpperCase()}.png`);
            document.getElementById('p2Name').children[0].innerHTML = this.matchData.p2.name;
            document.getElementById('p2Flag')?.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `/assets/flags/${this.matchData.p2.country.toUpperCase()}.png`);
            let pointIcons = document.querySelectorAll('[id*="Score"]');
            for (let i = 0; i < pointIcons.length; i++) {
                const point = pointIcons[i];
                (<HTMLElement>point).style.display = "none";
                // point.setAttribute("style", "display:none");
            }
            for (let i = 0; i < Math.ceil(this.matchData.best_of / 2); i++) {
                if (document.getElementById(`p1Score_${i + 1}_blank`)) document.getElementById(`p1Score_${i + 1}_blank`).style.display = "block";
                if (document.getElementById(`p2Score_${i + 1}_blank`)) document.getElementById(`p2Score_${i + 1}_blank`).style.display = "block";
            }
            for (let i = 0; i < this.matchData.p1.score; i++) {
                if (document.getElementById(`p1Score_${i + 1}_blank`)) document.getElementById(`p1Score_${i + 1}_blank`).style.display = "none";
                if (document.getElementById(`p1Score_${i + 1}`)) document.getElementById(`p1Score_${i + 1}`).style.display = "block";
            }
            for (let i = 0; i < this.matchData.p2.score; i++) {
                if (document.getElementById(`p2Score_${i + 1}_blank`)) document.getElementById(`p2Score_${i + 1}_blank`).style.display = "none";
                if (document.getElementById(`p2Score_${i + 1}`)) document.getElementById(`p2Score_${i + 1}`).style.display = "block";
            }
        }
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
