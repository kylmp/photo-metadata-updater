module.exports = {
  dateTimeToFormattedObj: function(datetime) {
    let res = { "date": "1970-01-01", "time": "00:00:00" };
    if (datetime !== undefined) {
      let split = datetime.split(" ");
      res.date = split[0].replaceAll(":", "-");
      res.time = split[1];
    }
    return res;
  }
}