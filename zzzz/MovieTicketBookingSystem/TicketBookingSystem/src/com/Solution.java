package com;

import java.util.Scanner;

public class Solution {
	public static void main(String[] args) {
		
		Scanner scan=new Scanner(System.in);
		
		System.out.println("Enter Movie Name:: ");
		String movieName=scan.next();

		int totalNoOfTickets=50;
		
		MovieTicketBooking movie=new MovieImpl(totalNoOfTickets);
		
		while(true){
			System.out.println("Welcome to Movie Ticket Booking Portal--");
			System.out.println("| 1. Book MyTickets           |");
			System.out.println("| 2. Cancel tickets           |");
			System.out.println("| 3. View Available Tickets   |");
			System.out.println("| 4. Exit                     |");
			System.out.println("----------Thank You------------");
			
			System.out.println("Please Enter your choice: ");
			int choice=scan.nextInt();
			
			switch(choice){
			
			case 1:
				System.out.println("Enter no of tickets to be Booked: ");
				int total=scan.nextInt();
				movie.bookTicket(total);
				break;
			case 2:
				System.out.println("Enter No Of Tickets to be Cancelled: ");
				int cancel=scan.nextInt();
				movie.cancelTicket(cancel);
				break;
			case 3:
				System.out.println("Available Tickets are: "+movie.viewTickets());
				break;
			case 4:
				System.out.println("Thank You!!! Please Visit Again");
				System.exit(0);
			default:
				System.out.println(movie.displayErrorMessage());
			}
			System.out.println("----------------------------");
		}
	}
}
