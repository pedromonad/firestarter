import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { ReportComponent } from './report.component';
import { ReportDetailComponent } from './report-detail/report-detail.component';
import { ReportRoute } from './report.route';
import { DateTimeAdapter, OWL_DATE_TIME_LOCALE, OwlDateTimeIntl, OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NativeDateTimeAdapter } from 'ng-pick-datetime/date-time/adapter/native-date-time-adapter.class';
import { DatepickerPtBrConfig } from '../core/_configs/datepicker-pt-br.config';

@NgModule({
  imports: [
    CoreModule,
    ReportRoute,
    OwlDateTimeModule,
    OwlNativeDateTimeModule
  ],
  declarations: [
    ReportComponent,
    ReportDetailComponent
  ],
  providers: [
    {provide: OWL_DATE_TIME_LOCALE, useValue: 'pt-br'},
    {provide: DateTimeAdapter, useClass: NativeDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE]},
    {provide: OwlDateTimeIntl, useClass: DatepickerPtBrConfig}
  ]
})
export class ReportModule { }
