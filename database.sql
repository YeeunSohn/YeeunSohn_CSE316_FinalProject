create table Employee(
employeeID VARCHAR(20) NOT NULL primary key,
email VARCHAR(50),
firstName VARCHAR(50),
lastName VARCHAR(50),
passcode VARCHAR(50) NOT NULL,
index(email));

create table LabEmployee(
labID VARCHAR(50) NOT NULL primary key,
password VARCHAR(50) NOT NULL
);

create table EmployeeTest(
testBarcode VARCHAR(50) NOT NULL primary key,
employeeID VARCHAR(20) NOT NULL,
collectionTime DATETIME default CURRENT_TIMESTAMP,
collectedBy VARCHAR(20) NOT NULL,
foreign key fk_Employee(employeeID) references Employee(employeeID),
foreign key fk_LabEmployee(collectedBy) references LabEmployee(labID)
);


create table Pool(
poolBarcode VARCHAR(50) NOT NULL primary key
);

create table PoolMap(
testBarcode VARCHAR(50) NOT NULL,
poolBarcode VARCHAR(50) NOT NULL,
foreign key fk_EmployeeTest(testBarcode) references EmployeeTest(testBarcode),
foreign key fk_Pool(poolBarcode) references Pool(poolBarcode)
);

create table Well(
wellBarcode VARCHAR(50) NOT NULL primary key
);

create table WellTesting(
poolBarcode VARCHAR(50) NOT NULL,
wellBarcode VARCHAR(50) NOT NULL primary key,
testingStartTime DATETIME,
testingEndTime DATETIME,
result VARCHAR(20) NOT NULL,
CONSTRAINT chk_reuslt CHECK (result IN ('in progress', 'negative', 'positive')),
foreign key fk_Pool(poolBarcode) references Pool(poolBarcode),
foreign key fk_Well(wellBarcode) references Well(wellBarcode)
);
