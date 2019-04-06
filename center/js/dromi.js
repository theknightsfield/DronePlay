
var arrayData = new Array();


function dromiInit() {
  setUploadData();
}

function dromiListInit() {
  getDromiList();
}

function setDromilist(data) {
  if (data == null || data.length == 0)
    return;

  data.forEach(function(item) {
    appendListTable(item.dname, item.dTimeStamp);
  });
}

var tableCount = 0;
function appendListTable(name, dtimestamp) {
  tableCount++;
  var strid = "dromi-" + tableCount;
  var appendRow = "<tr class='odd gradeX' id='" + strid + "'><td>" + tableCount + "</td>"
      + "<td width='60%' class='center' bgcolor='#eee'>"
      + name + "</td><td width='20%' class='center' bgcolor='#fff'> " + convert2data(dtimestamp).toString() + "</td></tr>";
  $('#dataTable-lists > tbody:last').append(appendRow);
}

function getDromiList() {
  var userid = getCookie("dev_user_id");
  var jdata = {"action": "dromi", "daction": "list", "clientid" : userid};

  showLoader();
  ajaxRequest(jdata, function (r) {
    hideLoader();
    if(r.result == "success") {
      if (r.data == null || r.data.length == 0) {
        alert("no data");
        return;
      }

      setDromilist(r.data);
    }
  }, function(request,status,error) {
    hideLoader();
    alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}

function convert2time(stime) {
  var gapTime = document.getElementById("gmtGapTime").value;
  return (new Date(stime).getTime() + (3600000 * (gapTime*=1)));
}

function uploadData(mname) {
    // if (arrayData == null || arrayData.length == 0) {
    //   alert("Please select any file !!");
    //   return;
    // }

    var selYear = document.getElementById("selYear");
    var dYear = selYear.options[selYear.selectedIndex].value;

    var selMon = document.getElementById("selMon");
    var dMon = selMon.options[selMon.selectedIndex].value;

    var selDay = document.getElementById("selDay");
    var dDay = selDay.options[selDay.selectedIndex].value;

    var selHour = document.getElementById("selHour");
    var dHour = selHour.options[selHour.selectedIndex].value;

    var dTimeStart = convert2time(dYear + "-" + dMon + "-" + dDay + " " + dHour + ":00:00");

    selYear = document.getElementById("selYear2");
    dYear = selYear.options[selYear.selectedIndex].value;

    selMon = document.getElementById("selMon2");
    dMon = selMon.options[selMon.selectedIndex].value;

    selDay = document.getElementById("selDay2");
    dDay = selDay.options[selDay.selectedIndex].value;

    selHour = document.getElementById("selHour2");
    dHour = selHour.options[selHour.selectedIndex].value;

    var dTimeEnd = convert2time(dYear + "-" + dMon + "-" + dDay + " " + dHour + ":59:59");

    var userid = getCookie("dev_user_id");
    var jdata = {"action": "dromi", "daction": "set", "name" :  mname, "data" : arrayData, "start": dTimeStart, "end" : dTimeEnd, "clientid" : userid};

    showLoader();
    ajaxRequest(jdata, function (r) {
      hideLoader();
      if(r.result == "success") {
        if (r.data == null || r.data.length == 0) {
          alert("no data");
          return;
        }

        setChartData(r.data);
      }
    }, function(request,status,error) {
      hideLoader();
      alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
    });
}

function showLoader() {
  $("#loading").show();
}

function hideLoader() {
  $("#loading").fadeOut(800);
}


function convert2data(t) {
    var date = new Date(t);
    return date;
}

var posIcons = new Array();
var chartTData = new Array();
var chartHData = new Array();
var chartLabelData = new Array();
var chartLocData = new Array();

var bMoved = false;

function addMapAndChartItem(i, item) {
  if ("t" in item && "h" in item) {
    chartTData.push({x: i, y: item.t});
    chartHData.push({x: i, y: item.h});

    var date = convert2data(item.time);
    var valM = String(date.getMonth() + 1).padStart(2, '0');
    var valD = String(date.getDate()).padStart(2, '0');
    var valH = String(date.getHours()).padStart(2, '0');
    var valMin = String(date.getMinutes()).padStart(2, '0');
    var valS = String(date.getSeconds()).padStart(2, '0');
    var dateString = date.getFullYear() + "-" + valM + "-" + valD + " " + valH + ":" + valMin + ":" + valS;
    chartLabelData.push(dateString);
  }

  if ("lat" in item && "lng" in item && "alt" in item) {
    chartLocData.push({lat : item.lat, lng : item.lng, alt: item.alt});

    var pos_icon = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([item.lng *= 1, item.lat *= 1])),
        name: dateString + " / lat: " + item.lat + ", lng: " + item.lng + ", alt: " + item.alt,
        mindex : i
    });

    pos_icon.setStyle(new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
          color: '#8959A8',
          crossOrigin: 'anonymous',
          src: './imgs/position2.png'
        }))
    }));

    posIcons.push(pos_icon);

    if (bMoved == false)
      flyTo(ol.proj.fromLonLat([item.lng *= 1, item.lat *= 1]), function() {bMoved=true;});
  }
}

var isMoved = true;
function setChartData(cdata) {
      posIcons = new Array();
      chartTData = new Array();
      chartHData = new Array();
      chartLabelData = new Array();
      chartLocData = new Array();

      var i = 0;
      cdata.forEach(function (item) {
        addMapAndChartItem(i, item);
        i++;
      });

      if (posIcons.length > 0) {
          map.on('click', function (evt) {
              var feature = map.forEachFeatureAtPixel(evt.pixel,
                  function (feature) {
                      return feature;
                  });

              if (feature) {
                  //alert(feature.get('name'));
                  var ii = feature.get('mindex');
                  //alert("index:" + ii);
                  openTip(window.myScatter, 0, ii);
              }
          });

          var posSource = new ol.source.Vector({
              features: posIcons
          });
          var posLayer = new ol.layer.Vector({
              source: posSource
          });

          map.addLayer(posLayer);
      }

      if (chartTData.length == 0) return;

      var dataSet = {datasets: [
          {
              label: '온도',
              borderColor: '#f00',
              backgroundColor: '#f66',
              data: chartTData
         },
         {
             label: '습도',
             borderColor: '#00f',
             backgroundColor: '#66f',
             data: chartHData
         }
      ]};

      var ctx = document.getElementById('chart1').getContext('2d');
      window.myScatter = Chart.Scatter(ctx, {
        data: dataSet,
        options: {
          title: {
            display: false,
            text: 'Temperature : RED / Humidity : BLUE'
          },
          tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        var d = data.datasets[tooltipItem.datasetIndex].data[0];
                        //var t = d.y;
                        var locdata = chartLocData[tooltipItem.index];
                        if(locdata && "lng" in locdata && "lat" in locdata) {
                          var latLng = ol.proj.fromLonLat([locdata.lng *= 1, locdata.lat *= 1]);

                          if (isMoved == true) {
                            isMoved = false;
                            flyTo(latLng, function() {isMoved=true;});
                          }
                        }

                        return chartLabelData[tooltipItem.index] + " / " + JSON.stringify(chartLocData[tooltipItem.index]);

                    }
                  },
                scales: {
                    xAxes: [{
                      ticks: {
                        userCallback: function(label, index, labels) {
                          return chartLabelData[label];
                        }
                      }
                    }]
                  },
                layout: {
                  padding: {
                      left: 20,
                      right: 30,
                      top: 20,
                      bottom: 20
                  }
                }
              }
          }
      });
}

function openTip(oChart,datasetIndex,pointIndex){
   if(oChart.tooltip._active == undefined)
      oChart.tooltip._active = []
   var activeElements = oChart.tooltip._active;
   var requestedElem = oChart.getDatasetMeta(datasetIndex).data[pointIndex];
   for(var i = 0; i < activeElements.length; i++) {
       if(requestedElem._index == activeElements[i]._index)
          return;
   }
   activeElements.push(requestedElem);
   oChart.tooltip._active = activeElements;
   oChart.tooltip.update(true);
   oChart.draw();
}

function closeTip(oChart,datasetIndex,pointIndex){
   var activeElements = oChart.tooltip._active;
   if(activeElements == undefined || activeElements.length == 0)
     return;
   var requestedElem = oChart.getDatasetMeta(datasetIndex).data[pointIndex];
   for(var i = 0; i < activeElements.length; i++) {
       if(requestedElem._index == activeElements[i]._index)  {
          activeElements.splice(i, 1);
          break;
       }
   }
   oChart.tooltip._active = activeElements;
   oChart.tooltip.update(true);
   oChart.draw();
}

function setDateBox() {
  var toDay = new Date();
  var dd = toDay.getDate();
  var mm = toDay.getMonth() + 1;
  var yyyy = toDay.getFullYear();
  var dh = toDay.getHours();

  var opt = '<option>';
  for(var i=2010;i<=yyyy;i++) {
      $('#selYear').append($(opt, {
          value: i,
          text: '' + i
      }));

      $('#selYear2').append($(opt, {
          value: i,
          text: '' + i
      }));
  }

  $('#selYear').val(yyyy).prop("selected", true);
  $('#selYear2').val(yyyy).prop("selected", true);

  for(var i=1;i<=12;i++) {
      var opt = '<option>';

      var valD = String(i).padStart(2, '0');;
      $('#selMon').append($(opt, {
          value: valD,
          text: valD
      }));

      $('#selMon2').append($(opt, {
          value: valD,
          text: valD
      }));
  }

  var valM = String(mm).padStart(2, '0');;
  $('#selMon').val(valM).prop("selected", true);
  $('#selMon2').val(valM).prop("selected", true);

  for(var i=1;i<=31;i++) {
      var valD = String(i).padStart(2, '0');;
      $('#selDay').append($(opt, {
          value: valD,
          text: valD
      }));

      $('#selDay2').append($(opt, {
          value: valD,
          text: valD
      }));
  }

  valM = String(dd).padStart(2, '0');;
  $('#selDay').val(valM).prop("selected", true);
  $('#selDay2').val(valM).prop("selected", true);

  for(var i=0;i<=24;i++) {
      var valD = String(i).padStart(2, '0');;
      $('#selHour').append($(opt, {
          value: valD,
          text: valD
      }));

      $('#selHour2').append($(opt, {
          value: valD,
          text: valD
      }));
  }

  valM = String(dh).padStart(2, '0');
  $('#selHour').val(valM).prop("selected", true);
  $('#selHour2').val(valM).prop("selected", true);
}

function analyzeData(datas) {
    var eachdata = datas.split("\n");
    if (eachdata.length == 0) return;

    var forChartData = new Array();
    eachdata.forEach(function (item) {
        var DData= item.split(",");
        var dTimeStamp = convert2time(DData[0]);
        forChartData.push({dtime:dTimeStamp, t: DData[2], h: DData[1]});
    });

    var startD = eachdata[0].split(",");
    var dStart = new Date(startD[0]);

    var endD = eachdata[eachdata.length - 2].split(",");
    var dEnd = new Date(endD[0]);

    $('#selYear').val(dStart.getFullYear()).prop("selected", true);
    $('#selYear2').val(dEnd.getFullYear()).prop("selected", true);

    var valM = String(dStart.getMonth() + 1).padStart(2, '0');
    $('#selMon').val(valM).prop("selected", true);
    valM = String(dEnd.getMonth() + 1).padStart(2, '0');
    $('#selMon2').val(valM).prop("selected", true);

    valM = String(dStart.getDate()).padStart(2, '0');
    $('#selDay').val(valM).prop("selected", true);
    valM = String(dEnd.getDate()).padStart(2, '0');
    $('#selDay2').val(valM).prop("selected", true);

    valM = String(dStart.getHours()).padStart(2, '0');
    $('#selHour').val(valM).prop("selected", true);
    valM = String(dEnd.getHours()).padStart(2, '0');
    $('#selHour2').val(valM).prop("selected", true);

    return forChartData;
}


function setUploadData() {
      $("#uploadBtn").click(function() {

          var mname = prompt("데이터셋의 이름을 입력해 주세요.", "");

          if (mname == null) {
              alert("데이터셋의 이름을 잘못 입력하셨습니다.");
              return;
          }

          uploadData(mname);
      });

      setDateBox();

      var handleFileSelect = function(evt) {
        var files = evt.target.files;
        var file = files[0];

        if (files && file) {
            var reader = new FileReader();

            reader.onload = function(readerEvt) {
                var binaryString = readerEvt.target.result;
                arrayData = analyzeData(binaryString);
            };

            reader.readAsText(file);
        }
    };

    if (window.File && window.FileReader && window.FileList && window.Blob) {
        document.getElementById('filePicker').addEventListener('change', handleFileSelect, false);
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }
}


function ajaxRequest(data, callback, errorcallback) {
    $.ajax({url : "https://api.droneplay.io/v1/",
           dataType : "json",
           crossDomain: true,
           cache : false,
           data : JSON.stringify(data),
           type : "POST",
           contentType: "application/json; charset=utf-8",
           async: false,
           beforeSend: function(request) {
              request.setRequestHeader("droneplay-token", getCookie('user_token'));
            },
           success : function(r) {
             console.log(JSON.stringify(r));
             callback(r);
           },
           error:function(request,status,error){
               console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
               errorcallback(request,status,error);
           }
    });
}
