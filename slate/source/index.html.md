---
title: DronePlay Open API Reference

language_tabs: # must be one of https://git.io/vQNgJ
  - shell
  - php 
  - javascript
  - python

toc_footers:
  - <a href='http://dev.droneplay.io/'>DronePlay 개발자홈</a>
  - <a href='http://code.droneplay.io/'>DronePlay Codes</a>
  - <a href='http://facebook.droneplay.io/'>DronePlay 페이스북</a>
  - <a href='http://droneplay.io/'>DronePlay 홈</a>

  - <a href='https://github.com/lord/slate'>Documentation Powered by Slate</a>
includes:
  - errors

search: true
---

# 소개 

'우리는 드론을 세계일주 시킬겁니다'

이곳은 드론 소프트웨어 개발자분들을 위한 예제코드와 Open API 정보를 제공하는 사이트 입니다.
뿐만아니라 드론을 '세계일주' 시키기 위한 관련 코드들도 계속해서 추가할 예정입니다.
쌈박하고 깔끔한 아이디어가 녹아든 쉽고 간편한 Open API와 코드들을 둘러 보세요.


# 토큰 발급 받기 

> Open API 사용을 위해 DronePlay 개발자 토큰을 발급 받으세요.


```shell

```

```php

```

```javascript

```

```python

```


> 

DronePlay Open API는 DronePlay 개발자 토큰을 파라메터로 입력해야 사용하실 수 있습니다.
아래 경로에서 먼저 토큰을 발급 받으세요.

[DronePlay 토큰얻기](http://dev.droneplay.io/dev/register/index.html).

발급받은 토큰의 사용방법은 각 Open API의 설명을 참고해 주세요.

<aside class="notice">
DronePlay Open API를 사용하시려면 반드시 <code>토큰</code>을 API의 파라메터로 입력해야 합니다. 간수에 유의해 주세요.
</aside>

# 드론의 현재위치 기록/읽기 

## 드론의 현재위치 기록하기 


```shell

curl "http://apis.airpage.org/your-access-token/position/your-email@mailmail.com/set/123.11/222.33/90"

```

```php

$get = curl_init();
curl_setopt($get, CURLOPT_URL, "http://apis.airpage.org/your-access-token/position/your-email@mailmail.com/set/123.11/222.33/90");
$result = curl_exec($get);
echo $result;

```

```javascript

$.ajax({
  url : "http://apis.airpage.org/your-access-token/position/your-email@mailmail.com/set/123.11/222.33/90",
  dataType : "jsonp",
  type : "GET",
  success : function(r) { console.log(JSON.stringify(r)); },
  error : function(err) { console.log(JSON.stringify(err)); }
});

```

```python

import requests 
URL = 'http://apis.airpage.org/your-access-token/position/your-email@mailmail.com/set/123.11/222.33/90?callback=abc' 
res = requests.get(URL)

if res.status_code is not 200:
  print ("error")
else:
  print ("success")
  print (res.text)

```

> 상기의 명령은 아래와 같이 JSON 구조로 응답합니다:

```json
  {
    "result": "success"
  }
```

현재의 좌표와 고도를 기록합니다.

### HTTP 요청 

`GET http://apis.airpage.org/[:token]/position/[:email]/set/[:lat]/[:lng]/[:alt]`

### URL 파라메터

파라메터 | 설명
--------- | -----------
token | 부여받은 개발자 토큰값을 입력합니다. 
position | 'position'을 입력합니다. 
email | 개발자 토큰을 받기위해 입력한 이메일 주소를 입력합니다.
set | 'set'을 입력합니다.
lat | latitude 좌표값를 입력합니다.
lng | longitude 좌표값를 입력합니다.
alt | 고도값을 입력합니다.

<aside class="warning">
GET 형식으로 API가 호출되는 만큼 토큰의 노출에 유의하세요!
</aside>

## 드론의 최근 위치 읽어오기


```shell

curl "http://apis.airpage.org/your-access-token/position/your-email@mailmail.com/get/1518534859144/1518534861111"

```

```php

$get = curl_init();
curl_setopt($get, CURLOPT_URL, "http://apis.airpage.org/your-access-token/position/your-email@mailmail.com/get");
$result = curl_exec($get);
echo $result;

```

```javascript

$.ajax({
  url : "http://apis.airpage.org/your-access-token/position/your-email@mailmail.com/get",
  dataType : "jsonp",
  type : "GET",
  success : function(r) { console.log(JSON.stringify(r)); },
  error : function(err) { console.log(JSON.stringify(err)); }
});

```

```python

import requests 
URL = 'http://apis.airpage.org/your-access-token/position/your-email@mailmail.com/get?callback=abc' 
res = requests.get(URL)

if res.status_code is not 200:
  print ("error")
else:
  print ("success")
  print (res.text)


```
> 상기의 명령은 아래와 같이 JSON 구조로 응답합니다:

```json

[
 { 
   "positiontime" : "Tue Feb 13 2018 15:44:40 GMT+0000 (UTC)",
   "dtimestamp" : 1518536680763,
   "lat" : "37.2435813",
   "lng" : "131.8661992",
   "alt" : 500,
   "clientid" : "theknightsfield@gmail.com"
 },
 {
   "positiontime" : "Tue Feb 13 2018 15:44:40 GMT+0000 (UTC)",
   "dtimestamp" : 1518536680765,
   "lat" : "37.2424227",
   "lng" : "131.8673264",
   "alt" : 500,
   "clientid" : "theknightsfield@gmail.com"
 },
 {
   "positiontime" : "Tue Feb 13 2018 15:44:40 GMT+0000 (UTC)",
   "dtimestamp" : 1518536680763,
   "lat" : "37.2421004",
   "lng" : "131.8680063",
   "alt" : 500,
   "clientid" : "theknightsfield@gmail.com"
 }
]

```

<aside class="warning">positiontime은 GMT+0 기준입니다. 서울기준이 아닙니다.</aside>
<aside class="warning">dtimestamp는 GMT+0 기준입니다. 서울기준이 아닙니다.</aside>

### HTTP 요청 

`GET http://apis.airpage.org/[:token]/position/[:email]/get/[:start]/[:end]`

### URL 파라메터

파라메터 | 설명
--------- | -----------
token | 부여받은 개발자 토큰값을 입력합니다. 
position | 'position'을 입력합니다. 
email | 개발자 토큰을 받기위해 입력한 이메일 주소를 입력합니다.
get | 'get'을 입력합니다.
start (optional) | timestamp 값입니다. GMT+0 기준입니다. start ~ end 시각 사이의 결과를 요청할 때 사용합니다.
end (optional) | timestamp 값입니다. GMT+0 기준입니다.

