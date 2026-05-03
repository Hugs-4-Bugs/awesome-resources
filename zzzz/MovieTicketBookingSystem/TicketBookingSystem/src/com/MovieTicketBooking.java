package com;

public interface MovieTicketBooking {
	void bookTicket(int noOfTicketBooked);
	void cancelTicket(int noOfTicketCanceled);
	int viewTickets();
	String displayErrorMessage();
}
