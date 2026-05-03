package com.Redbus.redbus.user.Controller;

import com.Redbus.redbus.user.payload.BookingDetailDto;
import com.Redbus.redbus.user.payload.PassengerDetails;
import com.Redbus.redbus.user.service.BookingService;
import com.Redbus.redbus.util.EmailService;
import com.Redbus.redbus.util.Service.PdfService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private BookingService bookingService ;
    private EmailService emailService;

    private PdfService pdfService;

    public BookingController(BookingService bookingService , EmailService emailService, PdfService pdfService) {
        this.bookingService = bookingService;
        this.emailService = emailService;
        this.pdfService = pdfService;
    }

    //    http://localhost:8080/api/bookings?busId=&ticketId=
    @PostMapping
    public ResponseEntity<BookingDetailDto> bookBus(
            @RequestParam("bus_id") String busId,
            @RequestParam("ticketId") String ticketId,
            @RequestBody PassengerDetails passengerDetails){


        BookingDetailDto booking = bookingService.createBooking(busId, ticketId, passengerDetails);

        if(booking!=null){

            byte[] pdfBytes = pdfService.generatePdf(booking);

            sendBookingConfirmationEmailWithAttachment(passengerDetails  , booking , pdfBytes);
        }

        return new ResponseEntity<>(booking, HttpStatus.OK);
    }

    private void sendBookingConfirmationEmailWithAttachment(
            PassengerDetails passengerDetails , BookingDetailDto booking , byte[] pdfBytes){
        String emailSubject = "Booking Confirmed . Booking Id"+booking.getBookingId();
       String emailBody = String.format("Your Booking Confirmed\n Name: %s %s",
               passengerDetails.getFirstName(),passengerDetails.getLastName());

       emailService.sendEmailWithAttachment(
               passengerDetails.getEmail(),emailSubject,emailBody,pdfBytes,"Booking Confirmation"  );

    }

}
