
//********************DB Setting**************************/

let User='root';
let host='localhost';
let Databasename='cse316';
let DatabasePass='cse316';

//*******************************************************/

var express = require('express');
var app=express();
var fs=require('fs');
var t=require('date-utils');
var port=3000;
var bodyParser = require('body-parser');                                                                     
var mysql=require('sync-mysql');
var ejs = require('ejs');
var msg=require('dialog');
const { Console } = require('console');
const { isRegExp } = require('util');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const { pbkdf2, pseudoRandomBytes } = require('crypto');
const { detect } = require('async');
const e = require('express');
const { connect } = require('http2');

global.loginID=null;
global.loginPass=null;
global.logintype=null;
global.employeeID=null;

global.emloginID=null;


global.editpoolcode=null;

global.editwellcode=null;
global.editwellpoolcode=null;
global.editwellresult=null;

var connection = new mysql({
    host: host,
    user: User,
    password: DatabasePass,
    database : Databasename
});





app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));




/******************************************************************** */

app.get('/labtech',function (req,res) {
   fs.readFile('index.html',function(error,data) {
        res.writeHead(200, { 'Content-Type' : 'text/html'});
        res.end(data);
   });
});
app.get('/Labhome',function (req,res) {
    fs.readFile('Labhome.html',function(err,data) {
        if(!err)
        {
         res.writeHead(200, { 'Content-Type' : 'text/html'});
         res.end(data);
        }
        else{
            console.log(err);
        }
    });
 });
 app.get('/employee',function (req,res) {
    fs.readFile('employee.html',function(err,data) {
        if(!err)
        {
         res.writeHead(200, { 'Content-Type' : 'text/html'});
         res.end(data);
        }
        else{
            console.log(err);
        }
    });
 });
 app.get('/employeeResult',function (req,res) {
     console.log(emloginID);
    var searchedquery= connection.query("SELECT * FROM employee where email = '" +emloginID +"'");
    console.log(searchedquery[0]['employeeID']);
    var searchredresult=connection.query("SELECT * FROM employee LEFT JOIN employeetest ON employee.employeeID = employeetest.employeeID LEFT JOIN poolmap ON employeetest.testBarcode = poolmap.testBarcode LEFT JOIN welltesting ON poolmap.poolBarcode=welltesting.poolBarcode WHERE employee.employeeID = '"+searchedquery[0]['employeeID']+"' AND welltesting.result IS NOT NULL ORDER BY welltesting.testingEndTime DESC");
    console.log(searchredresult);
    var testresult =[];
    var time=[];
    var tb=[];
    var pac=[];
    if(Array.isArray(searchredresult)==true)
    {
        for(i=0;i<searchredresult.length;i++)
        {
            tb.push(searchredresult[i]['testBarcode']);
            testresult.push(searchredresult[i]['result']);
            time.push(searchredresult[i]['collectionTime']);
        }
    } 
    else
    {
        tb.push(searchredresult['testBarcode']);
        testresult.push(searchredresult['result']);
        time.push(searchredresult['collectionTime']);
    }
    for(i=0;i<testresult.length;i++)
    {
        time[i]=time[i].slice(0,10);
        if(testresult[i]=="In Progress") testresult[i]="In-Progress";
        pac.push({time:time[i],result:testresult[i],tb:tb[i]});
    }


    fs.readFile('EmployeeResult.html','utf-8',function(err,data) {
        if(!err)
        {
            res.send(ejs.render(data, {
                data: pac,
                lgID : emloginID
            }));   
        }
        else
        {
            console.log(error);
        }
    });
 });
 app.get('/WellTesting',function (req,res) {
    var poollist= connection.query("SELECT poolBarcode,wellBarcode,result FROM " + Databasename+ ".welltesting");
    var resl=[];
    var eWell="";
    var eWellp="";
    var eWellr="";
    var eres=1;
    if(editwellcode!=null)eWell=editwellcode;
    if(editwellpoolcode!=null)eWellp=editwellpoolcode;
    if(editwellresult!=null)eWellr=editwellresult;


    for(i=0;i<poollist.length;i++)
    {
        if(poollist[i]['result']=='In Progress')
        poollist[i]['result']='In-Progress';
    }



    fs.readFile('WellTesting.html','utf-8',function(err,data) {
        if(!err)
        {
            editwellcode=null;
            editwellpoolcode=null;
            editwellresult=null;
                res.send(ejs.render(data, {
                    pool: eWellp,
                    well: eWell,
                    resu : eWellr,
                    data: poollist,
                    data2: resl
                }));   
        }
        else
        {
            console.log(error);
        }
    });
    
 });
 app.get('/PoolMapping',function (req,res) {
    var testdb=null;
    var pooldb=null;
    var pset="";
    
    if(editpoolcode==null)
    {
        var testlist= connection.query("SELECT Employeetest.testBarcode FROM " + Databasename+ ".Employeetest LEFT JOIN PoolMap ON EmployeeTest.testBarcode = poolmap.testBarcode WHERE poolmap.testBarcode is null");
    }
    else{
        var testlist= connection.query("SELECT Employeetest.testBarcode FROM " + Databasename+ ".Employeetest LEFT JOIN PoolMap ON EmployeeTest.testBarcode = poolmap.testBarcode WHERE poolmap.poolBarcode = '" + editpoolcode +"'");
        pset=editpoolcode;
        editpoolcode=null;
    }
    var poollist= connection.query("SELECT pool.poolBarcode FROM pool LEFT JOIN welltesting on pool.poolBarcode = welltesting.poolBarcode WHERE welltesting.wellBarcode is null");
    var result=[];
    
    for(i=0;i<poollist.length;i++)
    {
        var tstr="";
        var employlist = connection.query("SELECT * FROM EmployeeTest LEFT JOIN PoolMap ON EmployeeTest.testBarcode =  PoolMap.testBarcode WHERE poolBarcode = '"+poollist[i]['poolBarcode']+"'");
        for(j=0;j<employlist.length;j++)
        {
           tstr += employlist[j]['testBarcode'] + ",";
        }
        tstr=tstr.slice(0,tstr.length-1);
        result.push({pol:poollist[i]['poolBarcode'],tes:tstr});
    }
    fs.readFile('PoolMapping.html','utf-8',function(err,data) {
        if(!err)
        {
                res.send(ejs.render(data, {
                    set: pset,
                    data: testlist,
                    data2: result
                }));   
        }
        else
        {
            console.log(error);
        }
    });
    
  
 });

 app.get('/TestCollection', function(req,res) {
    var employee = connection.query("SELECT employeeID FROM "+ Databasename +".employee");
    var employeetests = connection.query("SELECT * FROM "+ Databasename +".employeetest");

    fs.readFile('TestCollection.html','utf-8',function(err,data) {
        if(!err)
        {
            res.send(ejs.render(data, {
                data: employeetests,
                tdata: employee
            }));   
        }
        else {
            console.log(err);
        }
    });   
});

app.get('/TestCollection/submit', function(req,res) {
    fs.readFile('TestCollectio/submit.html','utf8',function(err,data){
        if(err) {
            console.log('TestCollection Add Error');
        }
        else {
            res.send(data);
        }
    });
});


/********************************************************************** */
app.post("/Labhome", function (req, res, next) {
   let email=req.body['email'];
   let password=req.body['password'];
   let login=false;
   let IDDB= connection.query("SELECT * FROM " + Databasename+ ".labemployee where labID = '" + email + "'");
   for(i=0;i<IDDB.length;i++)
   {

       if(IDDB[i]['labID']==email&&IDDB[i]['password']==password)
       {
           loginID=email;
           loginPass=password;
           login=true;
       }
    }


    if(login==true)
        res.redirect("/Labhome");
    else
        msg.info("Wrong ID/Password")

});

app.post("/TestCollection/login", function (req, res, next) {
    let email=req.body['email'];
    let password=req.body['password'];
    let login=false;
    let IDDB= connection.query("SELECT * FROM " + Databasename+ ".labemployee where labID = '" + email + "'");
    for(i=0;i<IDDB.length;i++)
    {

        if(IDDB[i]['labID']==email&&IDDB[i]['password'])
        {
            loginID=email;
            loginPass=password;
            login=true;
        }
        }
        if(login==true)
            res.redirect("/TestCollection");
        else
            msg.info("Wrong ID/Password")
});

app.post("/TestCollection/submit", function (req, res, next) {
    let IDDB= connection.query("SELECT * FROM " + Databasename+ ".employeetest where testBarcode = '"+ req.body['testBarcode'] +"'");
    var error = connection.query("SELECT * FROM employee where employeeID = '" + req.body['employeeID'] + "'");

    if(error.length < 1) {
        msg.info("Invalid EmployeeID!");
        return;
    }
    if(IDDB.length!=0)
    {
        msg.info("WRONG INPUT");
    }
    else
    {
        var inserttest=connection.query("INSERT INTO "+ Databasename+ ".employeetest(testBarcode,employeeID,collectedBy) VALUES(?,?,?)", [req.body['testBarcode'],req.body['employeeID'],loginID]);
        res.redirect("/TestCollection");
    }
 
});

app.post('/TestCollection/delete', function(req,res) {
    var del = connection.query("delete from " + Databasename + ".employeetest where testBarcode = '" + Object.keys(req.body)[0] + "'");
    res.redirect("/TestCollection");
});



app.post("/PoolMapping", function (req, res, next) {
    if(loginID==null)
    {
        msg.info("You have not logged in, or you are not one of the lab employees.");
        res.redirect("/");
    }
    else{
        res.redirect("/PoolMapping");
    }
 });

app.post("/employee/logincol", function (req, res, next) {
    let email=req.body['email'];
    let password=req.body['password'];
    let login=false;
    let IDDB= connection.query("SELECT * FROM " + Databasename+ ".employee where email = '" + email + "'");
    for(i=0;i<IDDB.length;i++)
    {
 
        if(IDDB[i]['email']==email&&IDDB[i]['passcode']==password)
        {
            emloginID=email;
            login=true;
        }
     }
 
 
     if(login==true)
         res.redirect("/employeeResult");
     else
         msg.info("Wrong ID/Password")
 });
 app.post("/WellTesting/Submit", function (req, res, next) {



    var overwritting= connection.query("SELECT wellBarcode FROM " + Databasename+ ".well where wellBarcode = '" + req.body['WellBarcode'] + "'");
    var invalidpool= connection.query("SELECT * FROM " + Databasename+ ".welltesting where poolBarcode = '" + req.body['PoolBarcode'] + "' AND wellBarcode != '" + req.body['WellBarcode'] +"'");

    var Result="";
    var newDate= new Date();
    var time=newDate.toFormat('YYYY-MM-DD HH24:MI:SS');

    var eDATE=time;

    var searchquery;

    searchquery=connection.query("SELECT * FROM pool where poolBarcode =" + req.body['PoolBarcode']);

    if(searchquery.length==0)
    {
        msg.info("This pool barcode does not exist");
        res.redirect("/WellTesting");
        return;
    }

    if(req.body['WellBarcode']==""||req.body['PoolBarcode']=="")
    {
        msg.info("Wrong Input");
        res.redirect("/WellTesting");
    }
    else{

            if(invalidpool.length==0)
            {
                if(req.body['sltSample']==1)
                    Result="In Progress";
                else if(req.body['sltSample']==2)
                    Result="Positive";
                else   
                    Result="Negative";

                
                if(overwritting.length>=1)
                {
                    var squery = connection.query("SELECT testingStartTime FROM welltesting where wellBarcode = '" + req.body['WellBarcode']+"'");
                    var delquery= connection.query(" DELETE FROM welltesting WHERE wellBarcode = '" +req.body['WellBarcode']+"'");
                    var delquery= connection.query(" DELETE FROM well WHERE wellBarcode = '" +req.body['WellBarcode']+"'");

                }
                var poollist=connection.query("SELECT testBarcode FROM poolmap WHERE poolBarcode = '"+req.body['PoolBarcode']+"'");
                if(req.body['sltSample']==2 &&poollist.length>1)
                {
                    
                        msg.info("The assigned pool has multiple test Barcodes, so it will be \"In-progress\"");
                        Result="In Progress";
                }

                    var insertwell=connection.query("INSERT INTO "+ Databasename+  ".well(wellBarcode) VALUES(?)", [req.body['WellBarcode']]);
                    var insertwellTest= connection.query("INSERT INTO "+ Databasename +  ".welltesting(poolBarcode,wellBarcode,testingStartTime,testingEndTime,result) VALUES(?,?,?,?,?)", [req.body['PoolBarcode'],req.body['WellBarcode'],eDATE,eDATE,Result]);
               
            }   
            else{
                msg.info("The pool already had been assgined to the well OR does not exist");
            }
        }
        res.redirect("/WellTesting");
 });
 app.post("/WellTesting", function (req, res, next) {
    if(loginID==null)
    {
        msg.info("You have not logged in, or you are not one of the employees.");
        res.redirect("/");
    }
    else{
        res.redirect("/WellTesting");
    }
 });
 
 app.post("/PoolSubmit/Edit", function (req, res, next) {
    var d=req.body['CHEK'];
    if(Array.isArray(d)==true||d==undefined)
    {
        msg.info("You must select 1 column for editing");
    }
    else
    {
        editpoolcode = d;
        res.redirect("/PoolMapping");
    }
  
 });
 app.post("/WellTesting/Edit", function (req, res, next) {
     var d=req.body['CHEK'];
     console.log(req.body);
     if(Array.isArray(d)==true||d==undefined)
     {
         msg.info("You must select 1 column for editing");
     }
     else
     {
        var index=parseInt(req.body['CHEK']);
         editwellcode = req.body['well'][index];
         editwellpoolcode=req.body['pool'][index];
         editwellresult=req.body['resu'][index];
         res.redirect("/WellTesting");
     }
  
 });
 app.post("/WellTesting/Delete", function (req, res, next) {
    var d=req.body['CHEK'];
    if(d==undefined)
    {
        msg.info("You must select a column for deleting");
    }
    else
    {
        if(req.body['CHEK'].length>1)
        {

            for(i=0;i<req.body['CHEK'].length;i++)
            {
                var index=parseInt(req.body['CHEK'][i]);
                var delquery= connection.query(" DELETE FROM welltesting WHERE wellBarcode = '" +req.body['well'][index]+"'");
                var delquery= connection.query(" DELETE FROM well WHERE wellBarcode = '" +req.body['well'][index]+"'");
            }
        }
        else
        {
            var index=parseInt(req.body['CHEK']);
            var delquery= connection.query(" DELETE FROM welltesting WHERE wellBarcode = '" +req.body['well'][index]+"'");
            var delquery= connection.query(" DELETE FROM well WHERE wellBarcode = '" +req.body['well'][index]+"'");
        }

    }
    res.redirect("/WellTesting");
 
});
  app.post("/PoolMapping/Delete", function (req, res, next) {
     var c=req.body['CHEK'];
     if(Array.isArray(c)==true)
     {
        for(i=0;i<c.length;i++)
        {
            var delquery= connection.query(" DELETE FROM PoolMap WHERE poolBarcode = '" +c[i]+"'");
            var delquery= connection.query(" DELETE FROM Pool WHERE poolBarcode = '" +c[i]+"'");
        }
    }
    else
    {
        var delquery= connection.query(" DELETE FROM PoolMap WHERE poolBarcode = '" +c+"'");
        var delquery= connection.query(" DELETE FROM Pool WHERE poolBarcode = '" +c+"'");
    }
 
     res.redirect("/PoolMapping");

 });
 app.post("/PoolSubmit", function (req, res, next) {
    var bListlen;
    var searchquery;
    console.log(req.body);
    if(req.body['BList']==undefined)
    {
        msg.info("There are no test barcodes");
        res.redirect("/PoolMapping");
        return;
    }
    if(req.body['PoolBarcode']!=parseInt(req.body['PoolBarcode'],10))
    {
        msg.info("You should input integer for the barcode");
        return;
    }
    searchquery=connection.query("SELECT * from pool where poolBarcode = " + req.body['PoolBarcode']);
    if(searchquery.length>=1)
    {
        msg.info("This pool barcode already exists");
        return;
    }

    if(req.body['BList']!=undefined)
    {
        if(Array.isArray(req.body['BList']))
            bListlen=req.body['BList'].length;
        else
            bListlen=1;
    }
    else
        bListlen=null;

    if(bListlen==null||req.body['PoolBarcode']=="")
    {
            msg.info("WRONG INPUT");
            res.redirect("/PoolMapping");
    }
    var PoolOverwriting=connection.query("SELECT * FROM " + Databasename+ ".pool where poolBarcode = '" + req.body['PoolBarcode'] + "'");

    if(PoolOverwriting!=null)
    {
        var delquery= connection.query(" DELETE FROM PoolMap WHERE poolBarcode = '" + req.body['PoolBarcode']+"'");
        var delquery= connection.query(" DELETE FROM Pool WHERE poolBarcode = '" + req.body['PoolBarcode']+"'");
    }

    var insertpool=connection.query("INSERT INTO "+ Databasename+  ".pool(poolBarcode) VALUES(?)", [req.body['PoolBarcode']]);
    if(bListlen==1)
    {
        connection.query("INSERT INTO "+ Databasename+  ".poolmap(testBarcode, PoolBarcode) VALUES(?,?)",
        [parseInt(req.body['BList']),parseInt(req.body['PoolBarcode'])]);
    }
    else
    {
        for(i=0;i<bListlen;i++)
        {
            connection.query("INSERT INTO "+ Databasename+  ".poolmap(testBarcode, PoolBarcode) VALUES(?,?)",
                [parseInt(req.body['BList'][i]),parseInt(req.body['PoolBarcode'])]);
        }

    }
    res.redirect("/PoolMapping");
});


/******************************************************** */
app.listen(port, function()
{
    console.log('server on! http://localhost:'+port);
})
