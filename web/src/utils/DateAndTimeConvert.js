class DateAndTimeConvert {
  constructor(date, lang, secondsBool, noYear, noMonth, noTime, monthLonger) {
    this.date = date;
    this.time = date;
    this.lang = lang;
    this.secondsBool = secondsBool;
    this.noYear = noYear;
    this.noMonth = noMonth;
    this.noTime = noTime;
    this.monthLonger = monthLonger;
  }

  DateTimeConvert() {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ].map((m) => this.lang(m));

    const mydate = new Date(this.date);
    const day = mydate.getDate();
    const month = months[mydate.getMonth()];
    const year = mydate.getFullYear();
    const minutes = String(mydate.getMinutes()).padStart(2, '0');
    const hours = mydate.getHours();
    const isEN = this.lang('en') === 'en';
    const time = isEN
      ? `${hours > 12 ? hours - 12 : hours}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`
      : `${hours}:${minutes}`;

    return [
      day,
      this.noMonth ? '' : ` ${month}`,
      this.noYear ? '' : ` ${year}`,
      this.noTime ? '' : `, ${time}`,
    ].join('');
  }

  TimeConvert() {
    const YEAR = 365 * 24 * 60;
    const MONTH = 30 * 24 * 60;
    const DAY = 24 * 60;
    const HOUR = 60;

    const years = Math.floor(this.time / YEAR);
    const months = Math.floor((this.time % YEAR) / MONTH);
    const days = Math.floor(((this.time % YEAR) % MONTH) / DAY);
    const hours = Math.floor((((this.time % YEAR) % MONTH) % DAY) / HOUR);
    const mins = (((this.time % YEAR) % MONTH) % DAY) % HOUR;

    const parts = [
      years > 0 && `${years}${this.lang(years === 1 ? ' year ' : ' years ')}`,
      months > 0 &&
        `${months}${this.lang(months === 1 ? ' month ' : ' months ')}`,
      days > 0 && `${days}${this.lang(days === 1 ? ' day ' : ' days ')}`,
      hours > 0 && `${hours}${this.lang(' h ')}`,
      mins > 0 && `${mins}${this.lang(' min ')}`,
    ].filter(Boolean);

    return parts.join('').trim();
  }

  DateTimeConvertLocale() {
    const monthLonger = this.monthLonger || this.noMonth;
    const monthData =
      this.noMonth && !this.monthLonger ? undefined : monthLonger;
    return new Date(this.date).toLocaleString(this.lang('en-EN'), {
      day: 'numeric',
      month: monthData ? 'short' : undefined,
      year: this.noYear ? undefined : 'numeric',
      hour: this.noTime ? undefined : 'numeric',
      minute: this.noTime ? undefined : 'numeric',
      second: this.secondsBool ? 'numeric' : undefined,
    });
  }
}

export default DateAndTimeConvert;
