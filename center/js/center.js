
var bMonStarted = false;
var aPositions = new Array();
var pointSource;
var dokdo_view;
var dokdo_icon;
var map;
var geolocation;

$(function() {
  showLoader();
  mapInit();
  hideLoader();
  if (askToken() == false) {
    location.href="index.html";
    return;
  }

  var page_data = document.getElementById("page_data");
	var page_action = page_data.getAttribute("page_action");

  if (page_action == "center") {

  }
  else if (page_action == "design") {
    designInit();
  }
  else if (page_action == "list") {

  }
  else if (page_action == "monitor") {
    monitorInit();
  }
  else if (page_action == "dromi") {
    dromiInit();
  }
  else if (page_action == "dromi_list") {
    dromiListInit();
  }
});

function monitorInit() {
  var url_string = window.location.href;
	var page_id = location.search.split('mission_name=')[1];
	if (page_id != null)
		page_id = page_id.split('&')[0];

  getMissionToMonitor(page_id);
}

function designInit() {
  var draw = new ol.interaction.Draw({
      source: pointSource,
      type: 'Point'
    });

  map.addInteraction(draw);
  map.on('click', function(evt) {
        var coordinates = evt.coordinate;
        //alert(coordinates);
        appendDesignTable(coordinates);
  });

  el('track').addEventListener('change', function() {
    geolocation.setTracking(this.checked);
  });
}

function startMon() {
  if (bMonStarted == true) {
    bMonStarted = false;
    $('#startMonBtn').text("모니터링 시작하기");
    $("#startMonBtn").removeClass("btn-warning").addClass("btn-primary");
    $("#loader").hide();
  }
  else {
    nextMon();
  }
}

function nextMon() {
  var userid = getCookie("dev_user_id");
  var jdata = {"action" : "position", "daction" : "get", "clientid" : userid};

  ajaxRequest(jdata, function (r) {
    if(r.result == "success") {
      bMonStarted = true;
      $("#loader").show();
      $('#startMonBtn').text("모니터링 중지하기");
      $("#startMonBtn").removeClass("btn-primary").addClass("btn-warning");
      nexttour(r.data[0]);
    }
    else {
      alert("Mission 수행중이 아니거나 아직 드론의 위치정보를 확인할 수 없습니다.");
    }
  }, function(request,status,error) {
    alert("일시적인 오류가 발생했습니다.");
  });
}

function askToken() {
  var userid = getCookie("dev_user_id");
  var usertoken = getCookie("user_token");
  if (isSet(userid) == false || isSet(usertoken) == false)
    return false;

  $("#email_field").text(userid);
  $('#droneplaytoken_view').val(usertoken);

  return true;
}


function isSet(value) {
  if (value == "" || value == null || value == "undefined") return false;

  return true;
}

function getList() {

    var userid = getCookie("dev_user_id");
    var jdata = {"action" : "mission", "daction" : "get", "clientid" : userid};

    ajaxRequest(jdata, function (r) {
      if(r.result == "success") {
        appendMissionList(r.data);
        $('#getListBtn').hide(1500);
      }
    }, function(request,status,error) {
      alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
    });
}

function getMissionToMonitor(id) {
    var userid = getCookie("dev_user_id");
    var jdata = {"action" : "mission", "daction" : "get", "clientid": userid};

    ajaxRequest(jdata, function (r) {
      if(r.result == "success") {
        var missionList = r.data;
        if (missionList == null) return;
        if (missionList.length == 0) return;
        missionList.forEach(function (item, index, array) {
          if(item['name'] == id) {
            appendMissionsToMonitor(item['mission']);
          }
        });

        $("#loader").hide();
      }
    }, function(request,status,error) {
      alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      $("#loader").hide();
    });
}

function appendMissionsToMonitor(mission) {
    if (mission == null) return;
    if (mission.length == 0) return;
    mission.forEach(function (item, index, array) {
      tableCount++;

      var missionid = item['id'];

      if(missionid == null) {
        missionid = "mission-" + tableCount;
      }
      var appendRow = "<tr class='odd gradeX' id='" + missionid + "'><td>" + tableCount + "</td><td>"
          + "<table border=0 width='100%'><tr><td width='50%' class='center' bgcolor='#eee'>" + item['lat'] + "</td><td width='50%' class='center' bgcolor='#fff'> " + item['lon'] + "</td></tr>"
          + "<tr><td class='center' bgcolor='#eee'>" + item['alt'] + "</td><td class='center'>"
          + item['act']
          + "</td></tr></table>"
      + "</td></tr>"
      $('#monitorTable-points > tbody:last').append(appendRow);
    });
}

function appendDesignTable(coordinates) {
  tableCount++;
  var lonLat = ol.proj.toLonLat(coordinates);
  var strid = "mission-" + tableCount;
  aPositions.push( {lat:lonLat[1], lon: lonLat[0], alt: 3, act: 0, id: strid} );
  var appendRow = "<tr class='odd gradeX' id='misstr_" + tableCount + "'><td>" + tableCount + "</td><td conspan=3>"
      + "<table border=0 width='100%'><tr><td width='50%' class='center' bgcolor='#eee'>" + lonLat[1] + "</td><td width='50%' class='center' bgcolor='#fff'> " + lonLat[0] + "</td></tr>"
      + "<td class='center'><input name='altdata_" + tableCount + "' id='altdata_" + tableCount + "' type='text' class='form-control' value='3'></td></tr>"
      + "<tr>"
      + "<td class='center'><input name='speeddata_" + tableCount + "' id='speeddata_" + tableCount + "' type='text' class='form-control' value='3'></td>"
      + "<td class='center'>"
      + "<select class='form-control' id='actiondata_" + tableCount + "'>"
          + "<option selected value=0>STAY</option>"
          + "<option value=1>START_TAKE_PHOTO</option>"
          + "<option value=2>START_RECORD</option>"
          + "<option value=3>STOP_RECORD</option>"
          + "<option value=4>ROTATE_AIRCRAFT</option>"
          + "<option value=5>GIMBAL_PITCH</option>"
          + "<option value=7>CAMERA_ZOOM</option>"
          + "<option value=8>CAMERA_FOCUS</option>"
      + "</select> <input name='actionparam_" + tableCount + "' id='actionparam_" + tableCount + "' placeholder="action Param" type='text' class='form-control' value='0'>"
      + "</td></tr></table>"
  + "</td></tr>"
  $('#dataTable-points > tbody:last').append(appendRow);
}

function appendMissionList(data) {
    if (data == null) return;
    if (data.length == 0) return;
    data.forEach(function (item, index, array) {
        console.log(item, index);

        var appendRow = "<tr class='odd gradeX' id='row_" + index + "'><td class='center'>"
        + "<a href='./monitor.html?mission_name=" + item['name'] + "'>"
        + item['name']
        + "</a></td><td class='center'> - </td><td class='center'>"
        + item['regtime']
        + "</td><td class='center'>"
        + "<button class='btn btn-primary' type='button' onClick='btnRemove(\"" + item['name']+ "\", \"row_" + index + "\")'>"
        + "삭제</button></td></tr>";
        $('#dataTable-missions > tbody:last').append(appendRow);
    });
}


function ajaxRequestAddress(address, callback, errorcallback) {
    $.ajax({url : "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyANkdJYJ3zKXAjOdPFrhEEeq4M8WETn0-4",
           crossDomain: true,
           cache : false,
           type : "GET",
           async: false,
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

function btnSearch() {
    var query = $('#queryData').val();
    searchAddressToCoordinate(query);
}

// result by latlng coordinate
function searchAddressToCoordinate(address) {
    ajaxRequestAddress(address, function (r) {
      //if(r.result == "success") {
        var latLng = ol.proj.fromLonLat([r['results'][0].geometry.location.lng, r['results'][0].geometry.location.lat]);
        flyTo(latLng, function() {});
      //}
    }, function(request,status,error) {
      alert("잘못된 주소이거나 요청을 처리하는데 일시적인 오류가 발생했습니다.");
    });
}

var tableCount = 0;
function btnClear() {
    var r = confirm("정말로 지금까지 디자인한 Mission을 삭제하시겠습니까 ?");
    if (r == false) {
        return;
    }

    for(var i=1;i<=tableCount;i++) {
      $("#misstr_" + i).remove();
    }

    pointSource.clear();
    aPositions = new Array();
    tableCount = 0;
    //window.location.reload();
}

function btnRemove(name, trname) {
    var r = confirm("정말로 '" + name + "' Mission을 삭제하시겠습니까?");
    if (r == false) {
        return;
    }

    var userid = getCookie("dev_user_id");
    var jdata = {"action": "mission","mname" : name, "daction" : "delete", "clientid" : userid};

    ajaxRequest(jdata, function (r) {
      if(r.result == "success") {
        $("#" + trname).remove();
      }
    }, function(request,status,error) {});
}

function btnRegister() {
    if (aPositions.length == 0) {
      alert("좌표를 지정하지 않으셨습니다.");
      return;
    }

    var mname = prompt("Mission 이름을 입력해 주세요.", "");

    if (mname == null) {
        alert("Mission 이름을 잘못 입력하셨습니다.");
        return;
    }

    for (var i = 0; i < aPositions.length; i++) {
        var altdata = $("#altdata_" + (i + 1)).val();
        var actiondata = $("#actiondata_" + (i + 1)).val();
        aPositions[i].alt = altdata;
        aPositions[i].act = actiondata;
    }

    var userid = getCookie("dev_user_id");
    var jdata = {"action": "mission","mname" : mname, "daction" : "set", "missiondata" : aPositions, "clientid" : userid};

    ajaxRequest(jdata, function (r) {
      if(r.result == "success") {
        alert("Mission이 등록되었습니다.");
      }
    }, function(request,status,error) {});
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

function logOut() {
  setCookie("dev_user_id", "", -1);
  setCookie("user_token", "", -1);
  location.href="index.html";
}

function mapInit() {
  var dokdo = ol.proj.fromLonLat([131.8661992, 37.2435813]);
  var scaleLineControl = new ol.control.ScaleLine();

  dokdo_view = new ol.View({
      center: dokdo,
      zoom: 17
    });

  geolocation = new ol.Geolocation({
          // enableHighAccuracy must be set to true to have the heading value.
          trackingOptions: {
            enableHighAccuracy: true
          },
          projection: dokdo_view.getProjection()
  });

  var accuracyFeature = new ol.Feature();
  geolocation.on('change:accuracyGeometry', function() {
    accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
  });

  var positionFeature = new ol.Feature();
  positionFeature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({
        color: '#3399CC'
      }),
      stroke: new ol.style.Stroke({
        color: '#fff',
        width: 2
      })
    })
  }));

  dokdo_icon = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([131.8661992, 37.2435813]))
  });

  dokdo_icon.setStyle(new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        color: '#8959A8',
        crossOrigin: 'anonymous',
        src: './imgs/position.png'
      }))
    }));

  var vectorSource = new ol.source.Vector({
      features: [dokdo_icon, accuracyFeature, positionFeature]
    });

  var vectorLayer = new ol.layer.Vector({
      source: vectorSource
    });

  pointSource = new ol.source.Vector({});
  var pointLayer = new ol.layer.Vector({
      source: pointSource,
      style: new ol.style.Style({
            fill: new ol.style.Fill({
              color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
              color: '#ff0000',
              width: 2
            }),
            image: new ol.style.Circle({
              radius: 7,
              fill: new ol.style.Fill({
                color: '#ff0000'
              })
            })
          })
    });

  scaleLineControl.setUnits("metric");
  map = new ol.Map({
      target: 'map',
      controls: ol.control.defaults().extend([
            scaleLineControl
          ]),
      layers: [
          new ol.layer.Tile({
              preload: 4,
              source: new ol.source.OSM()
          }), vectorLayer, pointLayer
      ],
      // Improve user experience by loading tiles while animating. Will make
      // animations stutter on mobile or slow devices.
      loadTilesWhileAnimating: true,
      view: dokdo_view
    });


    // update the HTML page when the position changes.
    geolocation.on('change', function() {
      el('accuracy').innerText = geolocation.getAccuracy() + ' [m]';
      el('altitude').innerText = geolocation.getAltitude() + ' [m]';
      el('altitudeAccuracy').innerText = geolocation.getAltitudeAccuracy() + ' [m]';
      el('heading').innerText = geolocation.getHeading() + ' [rad]';
      el('speed').innerText = geolocation.getSpeed() + ' [m/s]';
      showLoader();
      flyTo(geolocation.getPosition(), function(){hideLoader();});
    });

    // handle geolocation error.
    geolocation.on('error', function(error) {
      var info = el('monitor');
      info.innerHTML = error.message;
      info.style.display = '';
    });


    geolocation.on('change:position', function() {
      var coordinates = geolocation.getPosition();
      positionFeature.setGeometry(coordinates ?
        new ol.geom.Point(coordinates) : null);
    });
}

// A bounce easing method (from https://github.com/DmitryBaranovskiy/raphael).
function bounce(t) {
    var s = 7.5625, p = 2.75, l;
    if (t < (1 / p)) {
        l = s * t * t;
    } else {
        if (t < (2 / p)) {
        t -= (1.5 / p);
            l = s * t * t + 0.75;
        } else {
            if (t < (2.5 / p)) {
                t -= (2.25 / p);
                l = s * t * t + 0.9375;
            } else {
                t -= (2.625 / p);
                l = s * t * t + 0.984375;
            }
        }
    }
    return l;
}

// An elastic easing method (from https://github.com/DmitryBaranovskiy/raphael).
function elastic(t) {
    return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
}


function showLoader() {
  $("#loading").show();
}

function hideLoader() {
  $("#loading").fadeOut(800);
}


function flyTo(location, done) {
    var duration = 1500;
    var zoom = dokdo_view.getZoom();
    var parts = 2;
    var called = false;

    dokdo_icon.setGeometry(new ol.geom.Point(location));

    function callback(complete) {
        --parts;
        if (called) {
            return;
        }
        if (parts === 0 || !complete) {
            called = true;
            done(complete);
        }
    }

    dokdo_view.animate({
      center: location,
      duration: duration
    }, callback);
    dokdo_view.animate({
      zoom: zoom - 1,
      duration: duration / 2
    }, {
        zoom: zoom,
        duration: duration / 2
    }, callback);
}

var beforeTime = "";
function nexttour(r) {
  if (r.positiontime == beforeTime) {
    setTimeout(function() {
              if (bMonStarted == false) return;
              nextMon();
    }, 5000);
    return;
  }

  if ("missionid" in r && $('#' + r.missionid).length > 0) {
    $('#' + r.missionid).children('td, th').css('background-color','#ff0');
  }
  else {
    tableCount++;
    var missionid = "mission-" + tableCount;
    var appendRow = "<tr class='odd gradeX' id='" + missionid + "'><td class='center'></td><td class='center'>" + r.lat + " | " + r.lng + "<hr size=1>" + r.alt + " | " + r.positiontime + " </td></tr>";
    $('#monitorTable-points > tbody:last').append(appendRow);
  }

  beforeTime = r.positiontime;
  var npos = ol.proj.fromLonLat([r.lng *= 1, r.lat *= 1]);
  flyTo(npos, function() {});

  setTimeout(function() {
            if (bMonStarted == false) return;
            nextMon();
  }, 2500);
}



function el(id) {
        return document.getElementById(id);
}

function setCookie(cName, cValue, cDay){
    var expire = new Date();
    expire.setDate(expire.getDate() + cDay);
    cookies = cName + '=' + escape(cValue) + '; path=/ '; // 한글 깨짐을 막기위해 escape(cValue)를 합니다.
    if(typeof cDay != 'undefined') cookies += ';expires=' + expire.toGMTString() + ';';
    document.cookie = cookies;
}


function getCookie(cName) {
    cName = cName + '=';
    var cookieData = document.cookie;
    var start = cookieData.indexOf(cName);
    var cValue = '';
    if(start != -1){
        start += cName.length;
        var end = cookieData.indexOf(';', start);
        if(end == -1)end = cookieData.length;
        cValue = cookieData.substring(start, end);
    }
    return unescape(cValue);
}
