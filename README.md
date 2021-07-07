# YeeunSohn_CSE316_FinalProject
> Fundamentals of Software Development 수업에서 진행한 프로젝트.
> Stony Brook University에서 코로나 타액검사를 할 때 사용할 수 있는 웹사이트 개발.
> 자세한 설명은 CSE316_Final.pdf 참고.

> 프론트엔드: HTML
> 
> 백엔드: Node.js
> 
> 데이터베이스: MySQL

------------------------------------
## 프로젝트 설명
* 프론트엔드는 간단하게 HTML으로 개발.

* Node.js 라이브러리를 통해 비동기 프로그래밍으로 백엔드 개발.

* Employee와 Lab Employee의 역할이 다르고 로그인 가능한 페이지도 다르기 때문에 데이터베이스(MySQL)에 따로 저장해서 구분.

* 코로나 타액검사의 과정에 맞춰서 테스트 바코드가 알맞은 곳(Pool, Well)에 들어가 있고 결과(positive, negative)가 올바르게 보여질 수 있도록 함.
-------------------------
## 실행 설명
* 실행 파일 이름: index.js

  * 실행 방법
  ```
  node index.js
  ```
  터미널에 입력 후 localhost:3000 으로 접속
------------------------------
## UML Database Schema
* 데이터베이스 파일 이름: database.sql

교수님이 주신 Schema를 기반으로 데이터베이스 생성

![image](https://user-images.githubusercontent.com/71821196/124680794-1c244600-df02-11eb-8c21-25b72cc8fbcb.png)

