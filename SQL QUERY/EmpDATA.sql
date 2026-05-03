create database if not exists EmpDATA;
use EmpDATA;
create table Employee (
empid bigint not null auto_increment,
emp_name varchar(50) default null,
emp_salary float default null,
emp_age integer default null,
emp_city varchar(50) default null,
primary key(empid));
