//package com.lcwd.test.services;
//
//import org.junit.*;
//
//import java.util.Date;
//
//public class CalculatorServiceTest
//{
//
//    int counter=0;
//
////    @BeforeClass
//    @BeforeClass // before all test cases
//    public static void init(){
//        System.out.println("Before all test cases:");
//        System.out.println("Started test : "+new Date());
//        //connection open|file open
//    }
//
//    //test method of addTwoNumbers
//
//    @Before // executes the method before each test case
//    public void beforeEach(){
//        System.out.println("Before each test case");
//        counter=0;
//    }
//
//    @Test(timeout = 2000)
//    public void addTwoNumbersTest() throws InterruptedException {
//
//        for (int i=1;i<=20;i++){
//             counter+=i;
//        }
//
//        Thread.sleep(3000);
//
//        System.out.println("test for addTwoNumbersTest");
//        int result = CalculatorService.addTwoNumbers(12, 45);
//        int expected=57;
//        System.out.println("Counter int first test case : "+counter);
//        Assert.assertEquals(expected,result);
//        //actual result
//        //expected result
//    }
//
//    @Test
//    public void sumAnyNumberTest(){
//
//        for (int i=1;i<=100;i++){
//            counter+=i;
//        }
//
//        System.out.println("test for sumAnyNumberTest");
//        int result = CalculatorService.sumAnyNumbers(2, 7, 8, 9);
//        int expectedResult=26;
//        System.out.println("Counter int first second case : "+counter);
//        Assert.assertEquals(expectedResult,result);
//    }
//
//
//    @AfterClass // after all test cases
//    public static void cleanup(){
//        System.out.println("After all test cases");
//        System.out.println("End test cases : "+new Date());
//    }
//
//
//    //Test- for launching test case
//    //BeforeClass- run before all test case
//    //AfterClass-run after all test case
//    //Before- run before each test case
//    //After- run after each test case
//
//
//
//
//}
