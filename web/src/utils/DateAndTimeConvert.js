class DateAndTimeConvert {
  constructor(date, lang, secondsBool, noYear, noMonth, noTime, monthLonger) {
    this.date = date; // number
    this.time = date; // number
    this.lang = lang; // t of useTranslation !Important for translation
    this.secondsBool = secondsBool; // bool
    this.noYear = noYear; // bool
    this.noMonth = noMonth; // bool
    this.noTime = noTime; // bool
    this.monthLonger = monthLonger
  }

  DateTimeConvert() {
    const months = [
      `${this.lang("Jan")}`,
      `${this.lang("Feb")}`,
      `${this.lang("Mar")}`,
      `${this.lang("Apr")}`,
      `${this.lang("May")}`,
      `${this.lang("Jun")}`,
      `${this.lang("Jul")}`,
      `${this.lang("Aug")}`,
      `${this.lang("Sep")}`,
      `${this.lang("Oct")}`,
      `${this.lang("Nov")}`,
      `${this.lang("Dec")}`,
    ];
    let dateTime = this.date;
    const mydate = new Date(dateTime);
    const currdate = mydate.getDate(dateTime);
    const currmonth = mydate.getMonth(dateTime);
    const curryear = mydate.getFullYear(dateTime);
    const minuts =
      mydate.getMinutes(dateTime) < 10
        ? `0${mydate.getMinutes(dateTime)}`
        : mydate.getMinutes(dateTime);
    const hours = mydate.getHours();
    const hoursEN = hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? "PM" : "AM";
    const country = this.lang("en");
    const time =
      country === "en" ? `${hoursEN}:${minuts} ${ampm}` : `${hours}:${minuts}`;
    const convertDate = `${currdate}${
      this.noMonth ? "" : ` ${months[currmonth]}`
    }${this.noYear ? "" : ` ${curryear}`}${this.noTime ? "" : `, ${time}`}`;

    return convertDate;
  }

  TimeConvert() {
    const yearInMinutes = 365 * 24 * 60;
    const monthInMinutes = 30 * 24 * 60;
    const dayInMinutes = 24 * 60;
    const hourInMinutes = 60;

    const years = Math.floor(this.time / yearInMinutes);
    const months = Math.floor((this.time % yearInMinutes) / monthInMinutes);
    const days = Math.floor(((this.time % yearInMinutes) % monthInMinutes) / dayInMinutes);
    const hours = Math.floor((((this.time % yearInMinutes) % monthInMinutes) % dayInMinutes) / hourInMinutes);
    const mins = (((this.time % yearInMinutes) % monthInMinutes) % dayInMinutes) % hourInMinutes;
    
    const timeText = `${years > 0 ? years + this.lang("year(s)") : ""}${months > 0 ? months + this.lang(" month(s) ") : ""}${days > 0 ? days + this.lang(" day(s) ") : ""}${hours > 0 ? hours + this.lang(" h ") : ""}${mins > 0 ? mins + this.lang(" min") : ""}`;

    return timeText.trim();    
  }
  
  DateTimeConvertLocale() {
    let dateTime = this.date;
    const MonthLonger = this.monthLonger ? this.monthLonger : this.noMonth
    const MounthData = this.noMonth && !this.monthLonger ? undefined : MonthLonger
    return new Date(dateTime).toLocaleString(this.lang('en-EN'), {
      day: 'numeric',
      month: !MounthData ? undefined : 'short',
      year: this.noYear ? undefined : 'numeric',
      hour: this.noTime ? undefined : 'numeric',
      minute: this.noTime ? undefined : 'numeric',
      second: this.secondsBool ? 'numeric' : undefined,
    });
  }

}

export default DateAndTimeConvert;
