package com.lcwd.test.services;

public class GSTService {

    private  GstProvider gstProvider;

 public int  calculateGst(){




     System.out.println("Calculating GST");

      int rate  = this.gstProvider.getGSTDetail();

      System.out.println("GST Rate is " + rate);


      return rate;


     
 }

}
