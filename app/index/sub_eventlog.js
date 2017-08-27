/*
eventlog related functions
*/
let $ = require('jquery')
var path    = require('path'),
    os      = require('os'),
    fs      = require('fs'),
    Promise = require('bluebird')

//eventlog = {time: '', pri: 0, cat: 1, src: '', dst: '', usr: '', msg: ''}
/*
Aug 10 00:19:47 SRA4600 SSLVPN: id=sslvpn sn=C0EAE49171B8 time="2017-08-10 00:19:47" vp_time="2017-08-09 22:19:47 UTC" fw=192.168.200.1 pri=5 m=0 c=1200 src=192.168.200.1 dst=192.168.200.1 user="Proxy" usr="Proxy" msg="20608:Child exit with status:0" agent="(null)" geoCountryID="0" geoCountryName="LAN" geoRegionName="unknown" geoCityName="unknown"
*/


module.exports = {
  LogSortFunc: function(index){
    console.log('submodule called!')
  },
  FilterLog: function(filter){
    console.log('eventlog filter:' + filter)
    $('#tableEventlog tbody').find('tr').hide()
    var rows = $("#tableEventlog tbody").find("tr").hide();
    var data = filter.split(" ");
    $.each(data, function(i, v) {
      rows.filter(":contains('" + v + "')").show();
    }) 
  },
  HideShowColumn: function(index, checked){
    if(!checked)
      $('td:nth-child('+index+'),th:nth-child('+index+')').show();
    else
      $('td:nth-child('+index+'),th:nth-child('+index+')').hide();
  },
  LoadEventLog: function (file) {
    // require('fs').readFileSync('abc.txt').toString().split('\n').forEach(function (line) { line; }) 
    console.log('Load eventlog file:' + file)
    return new Promise(function(resolve, reject){
      var itemlist = []
      var re = /([A-Za-z]{3}[ ]*[0-9]{1,2} [0-9]{2}:[0-9]{2}:[0-9]{2}).*pri=([0-9]).* c=([0-9]*).* src=([0-9\.]*).* dst=([0-9\.]*).* usr="([^"]*).* msg="([^"]*)"/
      fs.readFileSync(file).toString().split('\n').forEach(function(line){
        var eventlog = {}
        var match = re.exec(line)
        if(match){
          eventlog.time = match[1]
          eventlog.pri = match[2]
          eventlog.cat = match[3]
          eventlog.src = match[4]
          eventlog.dst = match[5]
          eventlog.usr = match[6]
          eventlog.msg = match[7]
          itemlist.push(eventlog)
        }
      })
      resolve(itemlist)
    })
  },
  PrintEventLog: function(itemlist){
    console.log("Find event log item:" + itemlist.length)
    //add item to table
    for(var i=0, len=itemlist.length; i<len; i++){
      var row = `
        <tr>
          <td>`+itemlist[i].time+`</td>
          <td>`+itemlist[i].pri+`</td>
          <td>`+itemlist[i].cat+`</td>
          <td>`+itemlist[i].src+`</td>
          <td>`+itemlist[i].dst+`</td>
          <td>`+itemlist[i].usr+`</td>
          <td>`+itemlist[i].msg+`</td>
        </tr>
      `
      $('#tableEventlog tbody').append(row)
    }
  }
}