import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

    constructor() { }

    monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    curDate = null;

    curMonth = "";
    days = 31;
    startDay = 0;

    dates = []

    ngOnInit(): void {
        const d = new Date();   
        this.updateDates(d);
    }       

    updateDates(date) {
        this.curDate = date;
        this.curMonth = this.monthNames[date.getMonth()];
        this.days = this.getDaysInMonth(date.getMonth(), date.getFullYear());

        let tempDate = new Date(`${date.getFullYear()}-${date.getMonth()}-01`);
        this.startDay = tempDate.getDay();

        for (let i = 0; i < this.days+this.startDay; i++) {
            if(i <= this.startDay+1) {
                this.dates[i] = {
                    date: 0,
                    event: false,
                }
            } else {
                this.dates[i] = {
                    date: i-this.startDay-1,
                    event: false
                }
            }
        }
    }

    changeDate(change) {
        this.curDate = new Date(this.curDate.setMonth(this.curDate.getMonth()+change))
        this.updateDates(this.curDate);
    }

    getDaysInMonth(month, year) {
        return new Date(year, month, 0).getDate()+1;
    };

}
