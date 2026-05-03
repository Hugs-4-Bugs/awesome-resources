package com;

public class MovieImpl implements MovieTicketBooking{
	static int totalNoOfTickets;
	
	public MovieImpl(int totalNoOfTickets){
		this.totalNoOfTickets=totalNoOfTickets;
	}
	
	static int total, cancel;
	
	@Override
	public void bookTicket(int noOfTicketBooked) {
		if(noOfTicketBooked<totalNoOfTickets){
			System.out.println("No of Tickets Booked: "+noOfTicketBooked);
			int total=totalNoOfTickets-noOfTicketBooked;
			System.out.println("Total no of Available Tickets: "+total);
		}
		else{
			try{
				throw new InsufficientTicketException("Can't Book the Tickets Due to Unavailability");
			}
			catch(Exception e){
				System.out.println(e.getMessage());
			}
		}
	}

	@Override
	public void cancelTicket(int noOfTicketCanceled) {
		System.out.println("No of Tickets Canceled: "+noOfTicketCanceled);
		cancel=totalNoOfTickets-noOfTicketCanceled;
		System.out.println("Total no of Available Tickets:"+cancel);
	}

	@Override
	public int viewTickets() {
		
		return cancel;
	}

	@Override
	public String displayErrorMessage() {
		
		return "Please Enter Valid Choice!!!";
	}
	
}
