import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

    constructor(
        public http: HttpClient,
    ) { }

    monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    curDate = null;

    curMonth = "";
    curYear = 0;
    days = 31;
    startDay = 0;

    dates = [];

    events: any = [
        // { "id": 3, "name": "Is a tourney :)", "startDate": "2020-03-08", "endDate": "2020-03-08", "color": "#02943d" },
        // { "id": 2147483647, "name": "gfdsgdfs", "startDate": "2020-03-14", "endDate": "2020-03-14", "color": "#6a687b" },
        // { "id": 4, "name": "Another tourney :))", "startDate": "2020-03-18", "endDate": "2020-03-18", "color": "#8b3ef7" },
        // { "id": 2147483651, "name": "OMEGALUL", "startDate": "2020-07-12", "endDate": "2020-07-15", "color": "#0cb099" },
        // { "id": 2147483921, "name": "dannys gay", "startDate": "2020-07-13", "endDate": "2020-07-27", "color": "#99fb24" }
    ]


    ngOnInit() {
        const d = new Date();

        this.events.sort(function (a, b) {
            var keyA = new Date(a.startDate),
                keyB = new Date(b.startDate);
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
        });

        this.fillCalendar();

        this.updateDates(d);
        this.updateEvents(d);
    }

    async fillCalendar(): Promise<void> {
        const d = new Date();
        this.events = await this.getDates().toPromise();
        for (let event of this.events) {
            event.color = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
        }
        console.log(this.events);
        this.updateDates(d);
        this.updateEvents(d);
        console.log(this.displayEvents);
    }

    displayEvents = [];

    updateEvents(date: Date) {
        this.displayEvents = [];
        if (this.events.length > 0) {
            for (let i in this.events) {
                const event = this.events[i];

                let eventStartDate = new Date(event.startDate);
                let eventEndDate = new Date(event.endDate);
                let monthStart = new Date(date.getFullYear(), date.getMonth(), 1);

                // console.log(eventStartDate)
                // console.log(eventStartDate)

                let margin = 10;

                if (eventStartDate.getFullYear() != date.getFullYear()) {
                    continue;
                }

                for (let j = 0; j < parseInt(i); j++) {
                    let eventDate = new Date(this.events[j].endDate);
                    // console.log(`comparing ${event.name} and ${this.events[j].name}`)
                    if (eventDate.getTime() > eventStartDate.getTime()) {
                        margin += 30;
                    }
                }

                if (eventStartDate.getMonth() == date.getMonth()) {
                    let timeDiff = eventEndDate.getTime() - eventStartDate.getTime();
                    // let dayDiff = (timeDiff / (1000 * 3600 * 24)) + this.startDay;
                    // let dayDiff2 = timeDiff / (1000 * 3600 * 24) + 1;



                    let adjustedDiff = (timeDiff / (1000 * 3600 * 24)) + this.startDay;
                    let diff = timeDiff / (1000 * 3600 * 24);

                    let start = (eventStartDate.getDate() + this.startDay) % 7 != 0 ? (eventStartDate.getDate() + this.startDay) % 7 : 7;
                    let end = start + diff > 7 ? 8 : start + diff + 1;

                    let row = ((eventStartDate.getDate() + this.startDay) / 7) % 1 == 0 ? ((eventStartDate.getDate() + this.startDay) / 7) - 1 : Math.floor((eventStartDate.getDate() + this.startDay) / 7);

                    console.log(adjustedDiff)
                    console.log(diff)
                    console.log(start)
                    console.log(end)
                    console.log(row)
                    if (diff+start > 6) {
                        // let numRows = ((diff + start + 1) / 7) % 1 == 0 ? (diff + start + 1) / 7 - 1 : Math.floor((diff + start + 1) / 7);
                        let finRow =  ((eventEndDate.getDate() + this.startDay) / 7) % 1 == 0 ? ((eventEndDate.getDate() + this.startDay) / 7) - 1 : Math.floor((eventEndDate.getDate() + this.startDay) / 7);
                        // let curRow = Math.floor((eventStartDate.getDate() + this.startDay) / 7);
                        let curRow = ((eventStartDate.getDate() + this.startDay) / 7) % 1 == 0 ? ((eventStartDate.getDate() + this.startDay) / 7) - 1 : Math.floor((eventStartDate.getDate() + this.startDay) / 7);
                        console.log(finRow)
                        // first elem
                        this.displayEvents.push({
                            name: event.name,
                            start: start,
                            end: 8,
                            row: curRow,
                            top: margin,
                            color: event.color,
                            id: event.id
                        })
                        for (let i = curRow; i < finRow && curRow < 4; i++) {
                            curRow += 1;
                            this.displayEvents.push({
                                name: event.name,
                                start: 1,
                                end: ((diff + start) - (7 * i)) + 1,
                                row: curRow,
                                top: margin,
                                color: event.color,
                                id: event.id
                            })
                        }
                    } else if (eventStartDate.getDate() == eventEndDate.getDate()) {
                        let start = (eventStartDate.getDate() + this.startDay) % 7 != 0 ? (eventStartDate.getDate() + this.startDay) % 7 : 7;
                        let row = ((eventStartDate.getDate() + this.startDay) / 7) % 1 == 0 ? ((eventStartDate.getDate() + this.startDay) / 7) - 1 : Math.floor((eventStartDate.getDate() + this.startDay) / 7);
                        this.displayEvents.push({
                            name: event.name,
                            start: start,
                            end: start + 1,
                            row: row,
                            top: margin,
                            color: event.color,
                            id: event.id
                        })
                    } else {
                        this.displayEvents.push({
                            name: event.name,
                            start: start,
                            end: end,
                            row: row,
                            top: margin,
                            color: event.color,
                            id: event.id
                        })
                    }
                } else if (eventEndDate.getMonth() == date.getMonth()) {
                    let timeDiff = eventEndDate.getTime() - monthStart.getTime();

                    let dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + this.startDay + 1;
                    let numRows = Math.ceil((dayDiff - 1) / 7);
                    let curRow = 0;

                    for (let i = 0; i < numRows && curRow < 4; i++) {
                        this.displayEvents.push({
                            name: event.name,
                            start: 1,
                            end: (dayDiff - (7 * i)),
                            row: curRow,
                            color: event.color,
                            id: event.id
                        })
                        curRow += 1;
                    }
                } else if (eventStartDate.getMonth() < date.getMonth() && eventEndDate.getMonth() > date.getMonth()) {
                    for (let j = 0; j < parseInt(i); j++) {
                        let eventDate = new Date(this.events[j].endDate);
                        if (eventDate.getTime() > eventStartDate.getTime()) {
                            margin += 30;
                        }
                    }
                    let numRows = Math.floor((this.getDaysInMonth(date.getMonth() + 1, date.getFullYear()) + this.startDay) / 7);
                    for (let i = 0; i <= numRows; i++) {
                        this.displayEvents.push({
                            name: event.name,
                            start: 1,
                            end: 8,
                            row: i,
                            top: margin,
                            color: event.color,
                            id: event.id
                        })

                    }
                }

            };
        }

    }

    updateDates(date) {
        this.curDate = date;
        this.curMonth = this.monthNames[date.getMonth()];
        this.curYear = date.getYear() + 1900;
        this.days = this.getDaysInMonth(date.getMonth() + 1, date.getFullYear());

        let tempDate = new Date(`${date.getFullYear()}-${date.getMonth() + 1}-01`);
        this.startDay = tempDate.getDay();

        this.dates = [];
        for (let i = 0; i < (Math.ceil((this.days + this.startDay - 1) / 7) * 7); i++) {
            if (i < this.startDay || i >= this.days + this.startDay - 1) {
                this.dates[i] = {
                    date: 0,
                    event: false,
                    col: i % 7,
                    row: Math.floor(i / 7)
                }
            } else {
                this.dates[i] = {
                    date: i - this.startDay + 1,
                    event: false,
                    col: i % 7,
                    row: Math.floor(i / 7)
                }
            }
        }
    }

    getDates(): Observable<any> {
        return this.http.get('/api/events');
    }

    changeDate(change) {
        this.curDate = new Date(this.curDate.setMonth(this.curDate.getMonth() + change))
        this.updateDates(this.curDate);
        this.updateEvents(this.curDate);
        console.log(this.displayEvents)
    }

    getDaysInMonth(month, year) {
        return new Date(year, month, 0).getDate() + 1;
    };
}
