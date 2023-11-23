class DateAndTimeConvert {
  constructor(date, leng, secondsBool, noYear, noMonth, noTime, monthLonger) {
    this.date = date; // number
    this.time = date; // number
    this.leng = leng; // t of useTranslation !Important for translation
    this.secondsBool = secondsBool; // bool
    this.noYear = noYear; // bool
    this.noMonth = noMonth; // bool
    this.noTime = noTime; // bool
    this.monthLonger = monthLonger
  }

  DateTimeConvert() {
    const months = [
      `${this.leng("Jan")}`,
      `${this.leng("Feb")}`,
      `${this.leng("Mar")}`,
      `${this.leng("Apr")}`,
      `${this.leng("May")}`,
      `${this.leng("Jun")}`,
      `${this.leng("Jul")}`,
      `${this.leng("Aug")}`,
      `${this.leng("Sep")}`,
      `${this.leng("Oct")}`,
      `${this.leng("Nov")}`,
      `${this.leng("Dec")}`,
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
    const country = this.leng("en");
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
    
    const timeText = `${years > 0 ? years + this.leng("year(s)") : ""}${months > 0 ? months + this.leng(" month(s) ") : ""}${days > 0 ? days + this.leng(" day(s) ") : ""}${hours > 0 ? hours + this.leng(" h ") : ""}${mins > 0 ? mins + this.leng(" min") : ""}`;

    return timeText.trim();    
  }
  
  DateTimeConvertLocale() {
    let dateTime = this.date;
    const MonthLonger = this.monthLonger ? this.monthLonger : this.noMonth
    const MounthData = this.noMonth && !this.monthLonger ? undefined : MonthLonger
    return new Date(dateTime).toLocaleString(this.leng('en-EN'), {
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
