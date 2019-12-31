---
title: DronePlay Open API Reference

language_tabs: # must be one of https://git.io/vQNgJ
  - shell
  - php
  - javascript
  - python

toc_footers:
  - <div class="fb-like" data-href="https://www.facebook.com/386832955100142" data-width="100" data-layout="button_count" data-action="like" data-size="small" data-show-faces="false" data-share="false"></div>
  - <a href='https://dev.droneplay.io/'>DronePlay 개발자홈</a>
  - <a href='https://groups.google.com/forum/#!forum/droneplay2018'>개발관련 문의게시판</a>
  - <a href='https://code.droneplay.io/'>DronePlay Codes</a>
  - <a href='https://facebook.droneplay.io/'>DronePlay 페이스북</a>
  - <a href='https://top.droneplay.io/'>DronePlay 홈</a>
  - <a href='https://github.com/lord/slate'>Documentation Powered by Slate</a>
  - © 2020 DronePlay
includes:
  - errors

search: true
---

# 소개

'우리는 드론을 세계일주 시킬겁니다'

이곳은 드론 소프트웨어 개발자분들을 위한 예제코드와 Open API 정보를 제공하는 사이트 입니다.
뿐만아니라 드론을 '세계일주' 시키기 위한 관련 코드들도 계속해서 추가할 예정입니다.
쌈박하고 깔끔한 아이디어가 녹아든 쉽고 간편한 Open API와 코드들을 둘러 보세요.


# Token 발급 받기

> Open API 사용을 위해 DronePlay 개발자 Token을 발급 받으세요.


```shell

```

```php

```

```javascript

```

```python

```


>

DronePlay Open API는 DronePlay 개발자 Token을 파라메터로 입력해야 사용하실 수 있습니다.
아래 경로에서 먼저 Token을 발급 받으세요.

[DronePlay 개발자Token 발급](https://dev.droneplay.io/dev/register/index.html).

발급받은 Token의 사용방법은 각 Open API의 설명을 참고해 주세요.

<aside class="notice">
DronePlay Open API를 사용하시려면 반드시 <code>Token</code>을 API의 파라메터로 입력해야 합니다. 간수에 유의해 주세요.
</aside>

# 드론의 현재위치 기록/읽기

## 드론의 현재위치 기록하기


```shell

curl -H "droneplay-token: DRONEPLAYTOKEN" -H "Content-type: application/json" -X POST -d '{"clientid":"EMAILADDRESS", "action":"position", "daction":"set", "lat" : "12.134132", "lng" : "12.1324", "alt" : 5, "act" : "0", "missionname" : "TESTMISSION1", "missionid" : "mission-1"}' https://api.droneplay.io/v1/

```

```php

$body['action'] = 'position';
$body['daction'] = 'set';
$body['clientid'] = 'EMAILADDRESS';
$body['lat'] = "12.134132";
$body['lng'] = "12.1324";
$body['alt'] = 5;
$body['act'] = "0";
$body['missionid'] = "mission-1";
$body['missionname'] = "TESTMISSION1";

$headers = array(
        'Content-Type: application/json',
        'droneplay-token: DRONEPLAYTOKEN'
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.droneplay.io/v1/');
curl_setopt($ch, CURLOPT_HTTPHEADER,  $headers);
curl_setopt($ch, CURLOPT_POST,    true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_POSTFIELDS,json_encode($body));
$response = curl_exec($ch);
//$json_list= json_decode($response, true);
curl_close($ch);

echo $response;


```

```javascript

var jdata = {"action":"position", "daction": "set", "clientid" : "EMAILADDRESS", "lat" : "12.134132", "lng" : "12.1324", "alt" : 5, "act" : "0", "missionid" : "mission-1", "missionname" : "TESTMISSION1"};

$.ajax({url : "https://api.droneplay.io/v1/",
       dataType : "json",
       contentType : "application/json",
       crossDomain: true,
       cache : false,
       data : JSON.stringify(jdata),
       type : "POST",
       async: false,
       beforeSend: function(request) {
          request.setRequestHeader("droneplay-token", "DRONEPLAYTOKEN");
        },
       success : function(r) {
         console.log(JSON.stringify(r));
         if(r.result == "success") {
           alert("Successfully, recorded.");
         }
       },
       error:function(request,status,error){
           alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
       }
});

```

```python

import requests
headers = {
    'Content-Type': 'application/json',
    'droneplay-token' : 'DRONEPLAYTOKEN'
}
data = {
    'action': 'position',
    'daction': 'set',
    'clientid' : 'EMAILADDRESS'
    'lat' : "12.134132",
    'lng' : "12.1324",
    'alt' : 5,
    "missionid" : "mission-1",
    "missionname" : "TESTMISSION1",
    "act" : "0"
}
url = 'https://api.droneplay.io/v1/'
response = requests.post(url, headers=headers,
                         data=json.dumps(data))
response.raise_for_status()
'response.json()

```

> 상기의 명령은 아래와 같이 JSON 구조로 응답합니다:

```json
  {
    "result": "success"
  }
```

현재의 좌표와 고도를 기록합니다.

### HTTP 요청

`POST https://apis.droneplay.io/v1/`

### URL 파라메터

파라메터 | 설명
--------- | -----------
droneplay-token | 부여받은 개발자 Token값을 헤더에 입력합니다.
clientid | 개발자 Token을 받기위해 입력한 이메일 주소를 입력합니다.
action | 'position'을 입력합니다.
daction | 'set'을 입력합니다.
lat | latitude 좌표값를 입력합니다.
lng | longitude 좌표값를 입력합니다.
alt | 고도값을 입력합니다. (미터)
act | 해당위치에서 수행한 행동 (개발자 임의 정의 가능)
missionid | MISSION의 ID (미션 저장하기 참고 - Optional)
missionname | MISSION의 이름 (미션 저장하기 참고 - Optional)

<aside class="warning">
Token의 노출에 유의하세요!
</aside>

## 드론의 최근 위치 읽어오기


```shell

curl -H "droneplay-token: DRONEPLAYTOKEN" -H "Content-type: application/json" -X POST -d '{"clientid":"EMAILADDRESS", "action":"position", "daction":"get", "start" : 1518534859144, "end" : 1518534861111}' https://api.droneplay.io/v1/

```

```php

$body['action'] = 'position';
$body['daction'] = 'get';
$body['clientid'] = 'EMAILADDRESS';
$body['start'] = 1518534859144;
$body['end'] = 1518534861111;

$headers = array(
        'Content-Type: application/json',
        'droneplay-token: DRONEPLAYTOKEN'
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.droneplay.io/v1/');
curl_setopt($ch, CURLOPT_HTTPHEADER,  $headers);
curl_setopt($ch, CURLOPT_POST,    true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_POSTFIELDS,json_encode($body));
$response = curl_exec($ch);
//$json_list= json_decode($response, true);
curl_close($ch);

echo $response;

```

```javascript


var jdata = {"action": "position", "daction": "get", "clientid" : "EMAILADDRESS", "start" : 1518534859144, "end" : 1518534861111 };

$.ajax({url : "https://api.droneplay.io/v1/",
       dataType : "json",
       contentType : "application/json",
       crossDomain: true,
       cache : false,
       data : JSON.stringify(jdata),
       type : "POST",
       async: false,
       beforeSend: function(request) {
          request.setRequestHeader("droneplay-token", "DRONEPLAYTOKEN");
        },
       success : function(r) {
         console.log(JSON.stringify(r));
         if(r.result == "success") {
           //r.data
         }
       },
       error:function(request,status,error){
           alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
       }
});

```

```python

import requests
headers = {
    'Content-Type': 'application/json',
    'droneplay-token' : 'DRONEPLAYTOKEN'
}
data = {
    'action': 'position'
    'daction': 'get',
    'clientid' : 'EMAILADDRESS'
    'start' : 1518534859144,
    'end' : 1518534861111
}
url = 'https://api.droneplay.io/v1/'
response = requests.post(url, headers=headers,
                         data=json.dumps(data))
response.raise_for_status()
'response.json()


```
> 상기의 명령은 아래와 같이 JSON 구조로 응답합니다:

```json
{
  "result" : "success",
  "data" : [
   {
     "positiontime" : "Tue Feb 13 2018 15:44:40 GMT+0000 (UTC)",
     "dtimestamp" : 1518536680763,
     "lat" : "37.2435813",
     "lng" : "131.8661992",
     "alt" : 500,
     "act" : "0",
     "missionname" : "TESTMISSION1",
     "missionid" : "mission-1",
     "clientid" : "EMAILADDRESS"
   },
   {
     "positiontime" : "Tue Feb 13 2018 15:44:40 GMT+0000 (UTC)",
     "dtimestamp" : 1518536680765,
     "lat" : "37.2424227",
     "lng" : "131.8673264",
     "alt" : 500,
     "act" : "0",
     "missionname" : "TESTMISSION1",
     "missionid" : "mission-2",
     "clientid" : "EMAILADDRESS"
   },
   {
     "positiontime" : "Tue Feb 13 2018 15:44:40 GMT+0000 (UTC)",
     "dtimestamp" : 1518536680763,
     "lat" : "37.2421004",
     "lng" : "131.8680063",
     "alt" : 500,
     "act" : "0",
     "missionname" : "TESTMISSION1",
     "missionid" : "mission-3",
     "clientid" : "EMAILADDRESS"
   }
  ]
}

```

<aside class="warning">positiontime은 GMT+0 기준입니다. 서울기준이 아닙니다.</aside>
<aside class="warning">dtimestamp는 GMT+0 기준입니다. 서울기준이 아닙니다.</aside>

### HTTP 요청

`POST https://api.droneplay.io/v1/`

### URL 파라메터

파라메터 | 설명
--------- | -----------
droneplay-token | 부여받은 개발자 Token값을 헤더에 입력합니다.
action | 'position'을 입력합니다.
daction | 'get'을 입력합니다.
clientid | 개발자 Token을 받기위해 입력한 이메일 주소를 입력합니다.
start (optional) | timestamp 값입니다. GMT+0 기준입니다. start ~ end 시각 사이의 결과를 요청할 때 사용합니다.
end (optional) | timestamp 값입니다. GMT+0 기준입니다.

# Mission 저장/불러오기

## Mission 저장


```shell

curl -H "droneplay-token: DRONEPLAYTOKEN" -H "Content-type: application/json" -X POST -d '{"clientid":"EMAILADDRESS", "action":"mission", "daction":"set", "mname" : MISSIONNAME, "missiondata" : [{"lat":"12.134132","lng":"12.1324","alt":5,"speed":0,"act":1,"actparam":1,"id":"mission-1"},{"lat":"12.134132","lng":"12.1324","alt":5,"speed":0,"act":1,"actparam":1,"id":"mission-2"}]}' https://api.droneplay.io/v1/

```

```php

$body['action'] = 'mission';
$body['daction'] = 'set';
$body['clientid'] = 'EMAILADDRESS';
$body['mname'] = "MISSIONNAME";
$body['missiondata'] = json_decode('[{"lat":"12.134132","lng":"12.1324","alt":5,"speed":0,"act":1,"actparam":1,"id":"mission-1"},{"lat":"12.134132","lng":"12.1324","alt":5,"speed":0,"act":1,"actparam":1,"id":"mission-2"}]');

$headers = array(
        'Content-Type: application/json',
        'droneplay-token: DRONEPLAYTOKEN'
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.droneplay.io/v1/');
curl_setopt($ch, CURLOPT_HTTPHEADER,  $headers);
curl_setopt($ch, CURLOPT_POST,    true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_POSTFIELDS,json_encode($body));
$response = curl_exec($ch);
//$json_list= json_decode($response, true);
curl_close($ch);

echo $response;


```

```javascript

var jdata = [{"lat":"12.134132","lng":"12.1324","alt":5,"speed":0,"act":1,"actparam":1,"id":"mission-1"},{"lat":"12.134132","lng":"12.1324","alt":5,"speed":0,"act":1,"actparam":1,"id":"mission-2"}];

$.ajax({url : "https://api.droneplay.io/v1/",
       dataType : "json",
       contentType : "application/json",
       crossDomain: true,
       cache : false,
       data : JSON.stringify(jdata),
       type : "POST",
       async: false,
       beforeSend: function(request) {
          request.setRequestHeader("droneplay-token", "DRONEPLAYTOKEN");
        },
       success : function(r) {
         console.log(JSON.stringify(r));
         if(r.result == "success") {
           //r.data;
         }
       },
       error:function(request,status,error){
           alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
       }
});

```

```python

import requests
headers = {
    'Content-Type': 'application/json',
    'droneplay-token' : 'DRONEPLAYTOKEN'
}
data = {
    'action': 'mission',
    'daction': 'set',
    'clientid' : 'EMAILADDRESS'
    "mname" : "MISSIONNAME",
    "missiondata" : [{"lat":"12.134132","lng":"12.1324","alt":5,"speed":0,"act":1,"actparam":1,"id":"mission-1"},{"lat":"12.134132","lng":"12.1324","alt":5,"speed":0,"act":1,"actparam":1,"id":"mission-2"]
}

url = 'https://api.droneplay.io/v1/'
response = requests.post(url, headers=headers,
                         data=json.dumps(data))
response.raise_for_status()
'response.json()

```

> 상기의 명령은 아래와 같이 JSON 구조로 응답합니다:

```json
  {
    "result": "success"
  }
```

DronePlay Mission Center에 Mission 데이터를 기록합니다.

### HTTP 요청

`POST https://apis.droneplay.io/v1/`

### URL 파라메터

파라메터 | 설명
--------- | -----------
droneplay-token | 부여받은 개발자 Token값을 헤더에 입력합니다.
clientid | 개발자 Token을 받기위해 입력한 이메일 주소를 입력합니다.
action | 'mission'을 입력합니다.
daction | 'set'을 입력합니다.
mname | Mission 이름을 입력합니다.
missiondata | Mission 데이터 목록을 입력합니다.

### missiondata 파라메터 포멧
[{lat:latitude, lng:longitude, alt:altitude, act:action, actparam:actionparam, speed:speed, id:mission-id}]

파라메터 | 설명
--------- | -----------
lat | 위도
lng | 경도
alt | 고도 (미터)
act | 해당위치에서 드론이 수행할 행동 (DJI기준, 또는 개발자 임의 정의)
actparam | action 에 대한 파라메터
id | Mission의 고유 아이디 (부여한 Mission 이름의 범위내에서 고유한 아이디, 개발자 임의입력 가능)

### act, action param 값 참고 (DJI 기준)
액션 | act 값
--------- | -----------
STAY|0
START_TAKE_PHOTO|1
START_RECORD|2
STOP_RECORD|3
ROTATE_AIRCRAFT|4
GIMBAL_PITCH|5

[DJI사의 WayPoint Action 값을 참고해 주세요](https://developer.dji.com/api-reference/android-api/Components/Missions/DJIWaypoint_DJIWaypointAction.html#djiwaypoint_djiwaypointactiontype_inline).


## Mission 불러오기


```shell

curl -H "droneplay-token: DRONEPLAYTOKEN" -H "Content-type: application/json" -X POST -d '{"clientid":"EMAILADDRESS", "action":"mission", "daction":"get"}' https://api.droneplay.io/v1/

```

```php

$body['action'] = 'mission';
$body['daction'] = 'get';
$body['clientid'] = 'EMAILADDRESS';

$headers = array(
        'Content-Type: application/json',
        'droneplay-token: DRONEPLAYTOKEN'
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.droneplay.io/v1/');
curl_setopt($ch, CURLOPT_HTTPHEADER,  $headers);
curl_setopt($ch, CURLOPT_POST,    true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_POSTFIELDS,json_encode($body));
$response = curl_exec($ch);
//$json_list= json_decode($response, true);
curl_close($ch);

echo $response;


```

```javascript

var jdata = {"action": "mission", "daction": "get", "clientid" : "EMAILADDRESS"};

$.ajax({url : "https://api.droneplay.io/v1/",
       dataType : "json",
       contentType : "application/json",
       crossDomain: true,
       cache : false,
       data : JSON.stringify(jdata),
       type : "POST",
       async: false,
       beforeSend: function(request) {
          request.setRequestHeader("droneplay-token", "DRONEPLAYTOKEN");
        },
       success : function(r) {
         console.log(JSON.stringify(r));
         if(r.result == "success") {
           //r.data;
         }
       },
       error:function(request,status,error){
           alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
       }
});

```

```python

import requests
headers = {
    'Content-Type': 'application/json',
    'droneplay-token' : 'DRONEPLAYTOKEN'
}
data = {
    'action': 'mission',
    'daction': 'get',
    'clientid' : 'EMAILADDRESS'
}

url = 'https://api.droneplay.io/v1/'
response = requests.post(url, headers=headers,
                         data=json.dumps(data))
response.raise_for_status()
'response.json()

```

> 상기의 명령은 아래와 같이 JSON 구조로 응답합니다:

```json
  {
    "result":"success",
    "data":[
          {
          "regtime":"Sun Dec 30 2018 13:11:39 GMT+0000 (UTC)",
          "mission":[
              {"alt":3,"lng":131.86471756082,"act":0,"id":"mission-1","lat":37.243835988516,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86645915266,"act":0,"id":"mission-2","lat":37.244423805175,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86671844684,"act":0,"id":"mission-3","lat":37.243568918929,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86493079644,"act":0,"id":"mission-4","lat":37.243182141771,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86491855886,"act":0,"id":"mission-5","lat":37.243758419995,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86492249835,"act":0,"id":"mission-6","lat":37.243906083699,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86492249835,"act":0,"id":"mission-7","lat":37.243903981846,"actparam":1, "speed":10}
            ],
          "name":"MISSIONNAME",
          "clientid":"EMAILADDRESS"
      },

      {
          "regtime":"Sun Dec 30 2018 13:11:39 GMT+0000 (UTC)",
          "mission":[
              {"alt":3,"lng":131.86471756082,"act":0,"id":"mission-1","lat":37.243835988516,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86645915266,"act":0,"id":"mission-2","lat":37.244423805175,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86671844684,"act":0,"id":"mission-3","lat":37.243568918929,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86493079644,"act":0,"id":"mission-4","lat":37.243182141771,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86491855886,"act":0,"id":"mission-5","lat":37.243758419995,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86492249835,"act":0,"id":"mission-6","lat":37.243906083699,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86492249835,"act":0,"id":"mission-7","lat":37.243903981846,"actparam":1, "speed":10}
            ],
          "name":"MISSIONNAME_2",
          "clientid":"EMAILADDRESS"
      }
    ]
  }
```
DronePlay Mission Center의 Mission 목록을 불러옵니다.

### HTTP 요청

`POST https://apis.droneplay.io/v1/`

### URL 파라메터

파라메터 | 설명
--------- | -----------
droneplay-token | 부여받은 개발자 Token값을 헤더에 입력합니다.
clientid | 개발자 Token을 받기위해 입력한 이메일 주소를 입력합니다.
action | 'mission'을 입력합니다.
daction | 'get'을 입력합니다.


## Mission 삭제하기


```shell

curl -H "droneplay-token: DRONEPLAYTOKEN" -H "Content-type: application/json" -X POST -d '{"clientid":"EMAILADDRESS", "action":"mission", "daction":"delete", "mname":"MISSIONNAME"}' https://api.droneplay.io/v1/

```

```php

$body['action'] = 'mission';
$body['daction'] = 'delete';
$body['clientid'] = 'EMAILADDRESS';
$body['mname'] = "MISSIONNAME";

$headers = array(
        'Content-Type: application/json',
        'droneplay-token: DRONEPLAYTOKEN'
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.droneplay.io/v1/');
curl_setopt($ch, CURLOPT_HTTPHEADER,  $headers);
curl_setopt($ch, CURLOPT_POST,    true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_POSTFIELDS,json_encode($body));
$response = curl_exec($ch);
//$json_list= json_decode($response, true);
curl_close($ch);

echo $response;


```

```javascript

var jdata = {"action":"mission", "daction": "delete", "clientid" : "EMAILADDRESS", "mname" : "MISSIONNAME"};

$.ajax({url : "https://api.droneplay.io/v1/",
       dataType : "json",
       contentType : "application/json",
       crossDomain: true,
       cache : false,
       data : JSON.stringify(jdata),
       type : "POST",
       async: false,
       beforeSend: function(request) {
          request.setRequestHeader("droneplay-token", "DRONEPLAYTOKEN");
        },
       success : function(r) {
         console.log(JSON.stringify(r));
         if(r.result == "success") {
           //r.data;
         }
       },
       error:function(request,status,error){
           alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
       }
});

```

```python

import requests
headers = {
    'Content-Type': 'application/json',
    'droneplay-token' : 'DRONEPLAYTOKEN'
}
data = {
    'action': 'mission',
    'daction': 'delete',
    'clientid' : 'EMAILADDRESS',
    'mname' : 'MISSIONNAME'
}

url = 'https://api.droneplay.io/v1/'
response = requests.post(url, headers=headers,
                         data=json.dumps(data))
response.raise_for_status()
'response.json()

```

> 상기의 명령은 아래와 같이 JSON 구조로 응답합니다:

```json
  {
    "result":"success"
  }
```
DronePlay Mission Center의 Mission 1개를 삭제합니다.

### HTTP 요청

`POST https://apis.droneplay.io/v1/`

### URL 파라메터

파라메터 | 설명
--------- | -----------
droneplay-token | 부여받은 개발자 Token값을 헤더에 입력합니다.
clientid | 개발자 Token을 받기위해 입력한 이메일 주소를 입력합니다.
action | 'mission' 입력합니다.
daction | 'delete' 입력합니다.
mname | 삭제할 Mission 이름을 입력합니다.




# 비행기록 저장하기/가져오기

## 비행기록 저장하기


```shell

curl -H "droneplay-token: DRONEPLAYTOKEN" -H "Content-type: application/json" -X POST -d '{"clientid":"EMAILADDRESS", "action":"position", "daction":"upload", "name" : "FLIGHTRECORDNAME", "data" : [{"lat":"12.134132","lng":"12.1324","alt":5,"speed":0,"act":1,"actparam":1,"id":"mission-1"},{"lat":"12.134132","lng":"12.1324","alt":5,"speed":0,"act":1,"actparam":1,"id":"mission-2"}]}' https://api.droneplay.io/v1/

```

```php

$body['action'] = 'position';
$body['daction'] = 'upload';
$body['clientid'] = 'EMAILADDRESS';
$body['name'] = "FLIGHTRECORDNAME";
$body['missiondata'] = json_decode('[{"lat":"12.134132","lng":"12.1324","alt":5,"speed":0,"act":1,"actparam":1,"id":"mission-1"},{"lat":"12.134132","lng":"12.1324","alt":5,"speed":0,"act":1,"actparam":1,"id":"mission-2"}]');

$headers = array(
        'Content-Type: application/json',
        'droneplay-token: DRONEPLAYTOKEN'
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.droneplay.io/v1/');
curl_setopt($ch, CURLOPT_HTTPHEADER,  $headers);
curl_setopt($ch, CURLOPT_POST,    true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_POSTFIELDS,json_encode($body));
$response = curl_exec($ch);
//$json_list= json_decode($response, true);
curl_close($ch);

echo $response;


```

```javascript

var jdata = {"clientid":"EMAILADDRESS", "action":"position", "daction":"upload", "name" : "FLIGHTRECORDNAME", "data" :[{"lat":"12.134132","lng":"12.1324","alt":5,"speed":0,"act":1,"actparam":1,"id":"mission-1"},{"lat":"12.134132","lng":"12.1324","alt":5,"speed":0,"act":1,"actparam":1,"id":"mission-2"}]};

$.ajax({url : "https://api.droneplay.io/v1/",
       dataType : "json",
       contentType : "application/json",
       crossDomain: true,
       cache : false,
       data : JSON.stringify(jdata),
       type : "POST",
       async: false,
       beforeSend: function(request) {
          request.setRequestHeader("droneplay-token", "DRONEPLAYTOKEN");
        },
       success : function(r) {
         console.log(JSON.stringify(r));
         if(r.result == "success") {
           //r.data;
         }
       },
       error:function(request,status,error){
           alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
       }
});

```

```python

import requests
headers = {
    'Content-Type': 'application/json',
    'droneplay-token' : 'DRONEPLAYTOKEN'
}
data = {
    'action': 'position',
    'daction': 'upload',
    'clientid' : 'EMAILADDRESS'
    "name" : "FLIGHTRECORDNAME",
    "data" : [{"lat":"12.134132","lng":"12.1324","alt":5,"speed":0,"act":1,"actparam":1,"id":"mission-1"},{"lat":"12.134132","lng":"12.1324","alt":5,"speed":0,"act":1,"actparam":1,"id":"mission-2"}]
}

url = 'https://api.droneplay.io/v1/'
response = requests.post(url, headers=headers,
                         data=json.dumps(data))
response.raise_for_status()
'response.json()

```

> 상기의 명령은 아래와 같이 JSON 구조로 응답합니다:

```json
  {
    "result": "success"
  }
```

DronePlay Mission Center에 Mission 데이터를 기록합니다.

### HTTP 요청

`POST https://apis.droneplay.io/v1/`

### URL 파라메터

파라메터 | 설명
--------- | -----------
droneplay-token | 부여받은 개발자 Token값을 헤더에 입력합니다.
clientid | 개발자 Token을 받기위해 입력한 이메일 주소를 입력합니다.
action | 'position'을 입력합니다.
daction | 'upload'를 입력합니다.
name | 비행기록 이름을 입력합니다.
data | 비행기록 목록을 입력합니다.

### missiondata 파라메터 포멧
[{lat:latitude, lng:longitude, alt:altitude, act:action, actparam:actionparam, speed:speed, id:mission-id}]

파라메터 | 설명
--------- | -----------
lat | 위도
lng | 경도
alt | 고도 (미터)
act | 해당위치에서 드론이 수행한 행동 (DJI기준, 또는 개발자 임의 정의)
actparam | action 에 대한 파라메터
id | Mission의 고유 아이디 (부여한 Mission 이름의 범위내에서 고유한 아이디, 개발자 임의입력 가능)

### act, action param 값 참고 (DJI 기준)
액션 | act 값
--------- | -----------
STAY|0
START_TAKE_PHOTO|1
START_RECORD|2
STOP_RECORD|3
ROTATE_AIRCRAFT|4
GIMBAL_PITCH|5

[DJI사의 WayPoint Action 값을 참고해 주세요](https://developer.dji.com/api-reference/android-api/Components/Missions/DJIWaypoint_DJIWaypointAction.html#djiwaypoint_djiwaypointactiontype_inline).


## 모든 비행기록 불러오기


```shell

curl -H "droneplay-token: DRONEPLAYTOKEN" -H "Content-type: application/json" -X POST -d '{"clientid":"EMAILADDRESS", "action":"position", "daction":"download"}' https://api.droneplay.io/v1/

```

```php

$body['action'] = 'position';
$body['daction'] = 'download';
$body['clientid'] = 'EMAILADDRESS';

$headers = array(
        'Content-Type: application/json',
        'droneplay-token: DRONEPLAYTOKEN'
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.droneplay.io/v1/');
curl_setopt($ch, CURLOPT_HTTPHEADER,  $headers);
curl_setopt($ch, CURLOPT_POST,    true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_POSTFIELDS,json_encode($body));
$response = curl_exec($ch);
//$json_list= json_decode($response, true);
curl_close($ch);

echo $response;


```

```javascript

var jdata = {"action": "position", "daction": "download", "clientid" : "EMAILADDRESS"};

$.ajax({url : "https://api.droneplay.io/v1/",
       dataType : "json",
       contentType : "application/json",
       crossDomain: true,
       cache : false,
       data : JSON.stringify(jdata),
       type : "POST",
       async: false,
       beforeSend: function(request) {
          request.setRequestHeader("droneplay-token", "DRONEPLAYTOKEN");
        },
       success : function(r) {
         console.log(JSON.stringify(r));
         if(r.result == "success") {
           //r.data;
         }
       },
       error:function(request,status,error){
           alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
       }
});

```

```python

import requests
headers = {
    'Content-Type': 'application/json',
    'droneplay-token' : 'DRONEPLAYTOKEN'
}
data = {
    'action': 'position',
    'daction': 'download',
    'clientid' : 'EMAILADDRESS'
}

url = 'https://api.droneplay.io/v1/'
response = requests.post(url, headers=headers,
                         data=json.dumps(data))
response.raise_for_status()
'response.json()

```

> 상기의 명령은 아래와 같이 JSON 구조로 응답합니다:

```json
  {
    "result":"success",
    "data":[
          {
          "regtime":"Sun Dec 30 2018 13:11:39 GMT+0000 (UTC)",
          "data":[
              {"alt":3,"lng":131.86471756082,"act":0,"id":"mission-1","lat":37.243835988516,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86645915266,"act":0,"id":"mission-2","lat":37.244423805175,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86671844684,"act":0,"id":"mission-3","lat":37.243568918929,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86493079644,"act":0,"id":"mission-4","lat":37.243182141771,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86491855886,"act":0,"id":"mission-5","lat":37.243758419995,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86492249835,"act":0,"id":"mission-6","lat":37.243906083699,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86492249835,"act":0,"id":"mission-7","lat":37.243903981846,"actparam":1, "speed":10}
            ],
          "name":"MISSIONNAME",
          "clientid":"EMAILADDRESS"
      },

      {
          "regtime":"Sun Dec 30 2018 13:11:39 GMT+0000 (UTC)",
          "mission":[
              {"alt":3,"lng":131.86471756082,"act":0,"id":"mission-1","lat":37.243835988516,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86645915266,"act":0,"id":"mission-2","lat":37.244423805175,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86671844684,"act":0,"id":"mission-3","lat":37.243568918929,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86493079644,"act":0,"id":"mission-4","lat":37.243182141771,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86491855886,"act":0,"id":"mission-5","lat":37.243758419995,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86492249835,"act":0,"id":"mission-6","lat":37.243906083699,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86492249835,"act":0,"id":"mission-7","lat":37.243903981846,"actparam":1, "speed":10}
            ],
          "name":"MISSIONNAME_2",
          "clientid":"EMAILADDRESS"
      }
    ]
  }
```

비행기록을 모두 불러옵니다.

### HTTP 요청

`POST https://apis.droneplay.io/v1/`

### URL 파라메터

파라메터 | 설명
--------- | -----------
droneplay-token | 부여받은 개발자 Token값을 헤더에 입력합니다.
clientid | 개발자 Token을 받기위해 입력한 이메일 주소를 입력합니다.
action | 'position'을 입력합니다.
daction | 'download'을 입력합니다.



## 비행기록 1개 불러오기


```shell

curl -H "droneplay-token: DRONEPLAYTOKEN" -H "Content-type: application/json" -X POST -d '{"clientid":"EMAILADDRESS", "action":"position", "daction":"download_spe", "name": "FLIGHTRECORDNAME"}' https://api.droneplay.io/v1/

```

```php

$body['action'] = 'position';
$body['daction'] = 'download_spe';
$body['name'] = 'FLIGHTRECORDNAME';
$body['clientid'] = 'EMAILADDRESS';

$headers = array(
        'Content-Type: application/json',
        'droneplay-token: DRONEPLAYTOKEN'
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.droneplay.io/v1/');
curl_setopt($ch, CURLOPT_HTTPHEADER,  $headers);
curl_setopt($ch, CURLOPT_POST,    true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_POSTFIELDS,json_encode($body));
$response = curl_exec($ch);
//$json_list= json_decode($response, true);
curl_close($ch);

echo $response;


```

```javascript

var jdata = {"action": "position", "daction": "download_spe", "clientid" : "EMAILADDRESS", 'name': 'FLIGHTRECORDNAME'};

$.ajax({url : "https://api.droneplay.io/v1/",
       dataType : "json",
       contentType : "application/json",
       crossDomain: true,
       cache : false,
       data : JSON.stringify(jdata),
       type : "POST",
       async: false,
       beforeSend: function(request) {
          request.setRequestHeader("droneplay-token", "DRONEPLAYTOKEN");
        },
       success : function(r) {
         console.log(JSON.stringify(r));
         if(r.result == "success") {
           //r.data;
         }
       },
       error:function(request,status,error){
           alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
       }
});

```

```python

import requests
headers = {
    'Content-Type': 'application/json',
    'droneplay-token' : 'DRONEPLAYTOKEN'
}
data = {
    'action': 'position',
    'daction': 'download_spe',
    'name': 'FLIGHTRECORDNAME',
    'clientid' : 'EMAILADDRESS'
}

url = 'https://api.droneplay.io/v1/'
response = requests.post(url, headers=headers,
                         data=json.dumps(data))
response.raise_for_status()
'response.json()

```

> 상기의 명령은 아래와 같이 JSON 구조로 응답합니다:

```json
  {
    "result":"success",
    "data":[
          {
          "regtime":"Sun Dec 30 2018 13:11:39 GMT+0000 (UTC)",
          "data":[
              {"alt":3,"lng":131.86471756082,"act":0,"id":"mission-1","lat":37.243835988516,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86645915266,"act":0,"id":"mission-2","lat":37.244423805175,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86671844684,"act":0,"id":"mission-3","lat":37.243568918929,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86493079644,"act":0,"id":"mission-4","lat":37.243182141771,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86491855886,"act":0,"id":"mission-5","lat":37.243758419995,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86492249835,"act":0,"id":"mission-6","lat":37.243906083699,"actparam":1, "speed":10},
              {"alt":3,"lng":131.86492249835,"act":0,"id":"mission-7","lat":37.243903981846,"actparam":1, "speed":10}
            ],
          "name":"MISSIONNAME",
          "clientid":"EMAILADDRESS"
      }
    ]
  }
```

지정한 이름의 비행기록 1개를 불러옵니다.

### HTTP 요청

`POST https://apis.droneplay.io/v1/`

### URL 파라메터

파라메터 | 설명
--------- | -----------
droneplay-token | 부여받은 개발자 Token값을 헤더에 입력합니다.
clientid | 개발자 Token을 받기위해 입력한 이메일 주소를 입력합니다.
action | 'position'을 입력합니다.
daction | 'download_spe'을 입력합니다.
name | 비행기록 이름을 입력합니다.


## 비행기록 삭제하기

```shell

curl -H "droneplay-token: DRONEPLAYTOKEN" -H "Content-type: application/json" -X POST -d '{"clientid":"EMAILADDRESS", "action":"position", "daction":"delete", "name":"FLIGHTRECORDNAME"}' https://api.droneplay.io/v1/

```

```php

$body['action'] = 'position';
$body['daction'] = 'delete';
$body['clientid'] = 'EMAILADDRESS';
$body['name'] = "FLIGHTRECORDNAME";

$headers = array(
        'Content-Type: application/json',
        'droneplay-token: DRONEPLAYTOKEN'
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.droneplay.io/v1/');
curl_setopt($ch, CURLOPT_HTTPHEADER,  $headers);
curl_setopt($ch, CURLOPT_POST,    true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_POSTFIELDS,json_encode($body));
$response = curl_exec($ch);
//$json_list= json_decode($response, true);
curl_close($ch);

echo $response;


```

```javascript

var jdata = {"action":"position", "daction": "delete", "clientid" : "EMAILADDRESS", "name" : "FLIGHTRECORDNAME"};

$.ajax({url : "https://api.droneplay.io/v1/",
       dataType : "json",
       contentType : "application/json",
       crossDomain: true,
       cache : false,
       data : JSON.stringify(jdata),
       type : "POST",
       async: false,
       beforeSend: function(request) {
          request.setRequestHeader("droneplay-token", "DRONEPLAYTOKEN");
        },
       success : function(r) {
         console.log(JSON.stringify(r));
         if(r.result == "success") {
           //r.data;
         }
       },
       error:function(request,status,error){
           alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
       }
});

```

```python

import requests
headers = {
    'Content-Type': 'application/json',
    'droneplay-token' : 'DRONEPLAYTOKEN'
}
data = {
    'action': 'position',
    'daction': 'delete',
    'clientid' : 'EMAILADDRESS',
    'mname' : 'MISSIONNAME'
}

url = 'https://api.droneplay.io/v1/'
response = requests.post(url, headers=headers,
                         data=json.dumps(data))
response.raise_for_status()
'response.json()

```

> 상기의 명령은 아래와 같이 JSON 구조로 응답합니다:

```json
  {
    "result":"success"
  }
```
비행기록 1개 삭제합니다.

### HTTP 요청

`POST https://apis.droneplay.io/v1/`

### URL 파라메터

파라메터 | 설명
--------- | -----------
droneplay-token | 부여받은 개발자 Token값을 헤더에 입력합니다.
clientid | 개발자 Token을 받기위해 입력한 이메일 주소를 입력합니다.
action | 'position' 입력합니다.
daction | 'delete' 입력합니다.
name | 삭제할 비행기록의 이름을 입력합니다.



# 비행기록 업로드

## DJI 비행기록 파일 업로드 하기


```shell

curl -H "droneplay-token: DRONEPLAYTOKEN" -H "Content-type: application/json" -X POST -d '{"clientid":"EMAILADDRESS", "action":"position", "daction":"convert", "reocordfile":"BASE64_ENCODED_DJI_FLIGHTRECORD_FILE"}' https://api.droneplay.io/v1/

```

```php

$body['action'] = 'position';
$body['daction'] = 'convert';
$body['clientid'] = 'EMAILADDRESS';
$body['reocordfile'] = 'BASE64_ENCODED_DJI_FLIGHTRECORD_FILE';

$headers = array(
        'Content-Type: application/json',
        'droneplay-token: DRONEPLAYTOKEN'
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.droneplay.io/v1/');
curl_setopt($ch, CURLOPT_HTTPHEADER,  $headers);
curl_setopt($ch, CURLOPT_POST,    true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_POSTFIELDS,json_encode($body));
$response = curl_exec($ch);
//$json_list= json_decode($response, true);
curl_close($ch);

echo $response;


```

```javascript

var jdata = {"action": "position", "daction": "convert", "clientid" : "EMAILADDRESS", "reocordfile":"BASE64_ENCODED_DJI_FLIGHTRECORD_FILE"};

$.ajax({url : "https://api.droneplay.io/v1/",
       dataType : "json",
       contentType : "application/json",
       crossDomain: true,
       cache : false,
       data : JSON.stringify(jdata),
       type : "POST",
       async: false,
       beforeSend: function(request) {
          request.setRequestHeader("droneplay-token", "DRONEPLAYTOKEN");
        },
       success : function(r) {
         console.log(JSON.stringify(r));
         if(r.result == "success") {
           //r.data;
         }
       },
       error:function(request,status,error){
           alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
       }
});

```

```python

import requests
headers = {
    'Content-Type': 'application/json',
    'droneplay-token' : 'DRONEPLAYTOKEN'
}
data = {
    'action': 'position',
    'daction': 'convert',
    'clientid' : 'EMAILADDRESS',
    'reocordfile' : 'BASE64_ENCODED_DJI_FLIGHTRECORD_FILE'
}

url = 'https://api.droneplay.io/v1/'
response = requests.post(url, headers=headers,
                         data=json.dumps(data))
response.raise_for_status()
'response.json()

```

> 상기의 명령은 아래와 같이 JSON 구조로 응답합니다:

```json
  {
    "result":"success"
  }
```

DJI 비행기록 파일을 분석하여 비행기록으로 저장합니다.
저장한 비행기록 파일은 비행기록 목록에서 확인할 수 있습니다.

### HTTP 요청

`POST https://apis.droneplay.io/v1/`

### URL 파라메터

파라메터 | 설명
--------- | -----------
droneplay-token | 부여받은 개발자 Token값을 헤더에 입력합니다.
clientid | 개발자 Token을 받기위해 입력한 이메일 주소를 입력합니다.
action | 'position'을 입력합니다.
daction | 'convert'을 입력합니다.
recordfile | Base64로 인코딩된 DJI Flight Record File 입니다. (포멧. "파일정보,Base64 Encoded Text")

DJI Flight Record file 위치:
https://forum.dji.com/thread-98213-1-1.html
