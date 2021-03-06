import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { CalendarData, initialCalendarData } from '../models/CalendarData';
import { Day } from '../models/Day';
import { NgDateRange } from '../models/NgDateRange';
import { getOptions, InsideOptions } from '../models/NgDateRangePickerOptions';
import { NgDaterangeShortcutEntity } from '../models/RangeShortcut';

@Component({
    selector: 'ng-datepicker-calendar',
    template: `
        <div class="calendar"
             [ngClass]="{
                    'is-opened': opened,
                    'is-to': opened === 'to',
                    'alignment-center': options.alignment === 'center',
                    'alignment-right': options.alignment === 'right'
                }">
            <div class="calendar-container">
                <div class="controls">
                        <span class="control-icon" (click)="prevMonth()" [class.disabled]="!calendar.prevMonth">
                          <svg width="13px" height="20px" viewBox="0 44 13 20" version="1.1">
                            <path d="M11.7062895,64 C11.6273879,64 11.5477012,63.9744846 11.480576,63.921491 L0.139160349,54.9910879 C0.0551556781,54.9247477 0.00451734852,54.8250413 0.000199351429,54.7174839 C-0.00333355528,54.6107116 0.0402389608,54.5074722 0.119140544,54.4356364 L11.4605562,44.095211 C11.6093308,43.9589979 11.8401474,43.9707742 11.9751829,44.1187637 C12.1110036,44.2675384 12.1004048,44.4983549 11.9516302,44.6333905 L0.928176181,54.6841175 L11.9323955,63.3491601 C12.0905912,63.4735969 12.1176768,63.7028433 11.9928475,63.861039 C11.9206191,63.9521095 11.8138469,64 11.7062895,64 Z" id="Shape" stroke="none" fill="#000000" fill-rule="nonzero"></path>
                          </svg>
                        </span>
                    <span class="control-title">{{ calendar.month | date:'MMMM y' }}</span>
                    <span class="control-icon" (click)="nextMonth()" [class.disabled]="!calendar.nextMonth">
                          <svg width="13px" height="20px" viewBox="21 44 13 20">
                            <path d="M32.7062895,64 C32.6273879,64 32.5477012,63.9744846 32.480576,63.921491 L21.1391603,54.9910879 C21.0551557,54.9247477 21.0045173,54.8250413 21.0001994,54.7174839 C20.9966664,54.6107116 21.040239,54.5074722 21.1191405,54.4356364 L32.4605562,44.095211 C32.6093308,43.9589979 32.8401474,43.9707742 32.9751829,44.1187637 C33.1110036,44.2675384 33.1004048,44.4983549 32.9516302,44.6333905 L21.9281762,54.6841175 L32.9323955,63.3491601 C33.0905912,63.4735969 33.1176768,63.7028433 32.9928475,63.861039 C32.9206191,63.9521095 32.8138469,64 32.7062895,64 Z" id="Shape" stroke="none" fill="#000000" fill-rule="nonzero" transform="translate(27.035642, 54.000000) scale(-1, 1) translate(-27.035642, -54.000000) "></path>
                          </svg>
                        </span>
                </div>
                <div class="day-names">
                    <span class="day-name" *ngFor="let name of options.dayNames">{{ name }}</span>
                </div>
                <div class="days">
                    <div class="day"
                         *ngFor="let d of calendar.days; let i = index;"
                         [ngClass]="{
                                   'is-within-range': d.isWithinRange,
                                   'is-from': d.from,
                                   'is-to': d.to,
                                   'is-first-weekday': d.weekday === 1,
                                   'is-last-weekday': d.weekday === 0,
                                   'is-not-current-month': !d.currentMonth,
                                   'is-out-of-limit-range': d.outOfLimitRange
                                }"
                         (click)="clickDay(d)"
                    >
                        <span class="day-num" [class.is-active]="d.from || d.to">{{ d.day }}</span>
                    </div>
                </div>
            </div>
            <div class="side-container">
                <div class="side-container-buttons">
                    <button
                            *ngFor="let item of options.shortCuts"
                            type="button"
                            class="side-button"
                            [class.is-active]="(range$ | async) === item.title"
                            (click)="selectDefaultRange(item)"
                    >
                        {{item.title}}
                    </button>
                </div>
                <span class="close-icon" (click)="close.emit()">
                        <svg width="20px" height="20px" viewBox="47 44 20 20" version="1.1">
                          <g id="Group" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(48.000000, 44.000000)">
                            <path d="M19.6876399,20 C19.6047542,19.999927 19.52529,19.9669423 19.4667175,19.9082976 L0.0839056416,0.525743396 C-0.0308734765,0.402566324 -0.0274867013,0.210616527 0.0915663128,0.0915650956 C0.210619327,-0.0274863359 0.402571676,-0.030873066 0.525750385,0.0839045261 L19.9085623,19.4664587 C19.9978567,19.5558631 20.0245499,19.6902301 19.9762091,19.8069762 C19.9278683,19.9237223 19.8139998,19.9998889 19.6876399,20 Z" id="Shape" fill="#000000" fill-rule="nonzero"></path>
                            <path d="M0.312360116,20 C0.186000167,19.9998889 0.0721317315,19.9237223 0.0237909073,19.8069762 C-0.0245499168,19.6902301 0.0021432967,19.5558631 0.0914377445,19.4664587 L19.4742496,0.0839045261 C19.5974283,-0.030873066 19.7893807,-0.0274863359 19.9084337,0.0915650956 C20.0274867,0.210616527 20.0308735,0.402566324 19.9160944,0.525743396 L0.533282488,19.9082976 C0.474709982,19.9669423 0.395245751,19.999927 0.312360116,20 L0.312360116,20 Z" id="Shape" fill="#000000" fill-rule="nonzero"></path>
                          </g>
                        </svg>
                    </span>
            </div>
        </div>
    `,
    styleUrls: ['calendar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent {
    @Input() public options: InsideOptions = getOptions();
    @Input() public opened: null | 'from' | 'to' = null;
    @Input() public calendar: CalendarData = initialCalendarData;
    @Output() public close = new EventEmitter();
    @Output() public changeMonth = new EventEmitter<Date>();
    @Output() public changeRange = new EventEmitter<Partial<NgDateRange>>();
    @Output() public applyShortcut = new EventEmitter<NgDaterangeShortcutEntity>();

    public range$ = new BehaviorSubject<string | null>(null);

    public prevMonth(): void {
        if (this.calendar.prevMonth) {
            this.changeMonth.emit(this.calendar.prevMonth);
        }
    }

    public nextMonth(): void {
        if (this.calendar.nextMonth) {
            this.changeMonth.emit(this.calendar.nextMonth);
        }
    }

    public clickDay(day: Day): void {
        if (day.outOfLimitRange) {
            return;
        }

        if (day.currentMonth) {
            return this.selectDate(day.date);
        }

        return this.selectMonth(day.date);
    }

    public selectDate(date: Date): void {
        if (this.opened) {
            this.changeRange.emit({
                [this.opened]: date,
            });
            this.range$.next(null);
        }
    }

    public selectMonth(date: Date): void {
        this.changeMonth.emit(date);
    }

    public selectDefaultRange(range: NgDaterangeShortcutEntity): void {
        this.applyShortcut.emit(range);
        this.range$.next(range.title);
    }
}
