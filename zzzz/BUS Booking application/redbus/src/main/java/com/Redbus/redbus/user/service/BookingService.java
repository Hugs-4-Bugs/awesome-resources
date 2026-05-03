package com.Redbus.redbus.user.service;

import com.Redbus.redbus.operator.entity.BusOperator;
import com.Redbus.redbus.operator.entity.TicketCost;
import com.Redbus.redbus.operator.repository.BusOperatorRepository;
import com.Redbus.redbus.operator.repository.TicketCostRepository;
import com.Redbus.redbus.user.Repository.BookingRepository;
import com.Redbus.redbus.user.entity.Booking;
import com.Redbus.redbus.user.payload.BookingDetailDto;
import com.Redbus.redbus.user.payload.PassengerDetails;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


import java.util.UUID;

@Service
public class BookingService {

    @Value("${stripe.api.Key}")
    private String stripeApiKey;
    
    private BusOperatorRepository busOperatorRepository;

    public BookingService(BusOperatorRepository busOperatorRepository, 
                          TicketCostRepository ticketCostRepository,
                          BookingRepository bookingRepository) {
        this.busOperatorRepository = busOperatorRepository;
        this.ticketCostRepository = ticketCostRepository;
        this.bookingRepository = bookingRepository;
    }

    private TicketCostRepository ticketCostRepository;
    private BookingRepository bookingRepository;
    
    public BookingDetailDto createBooking(
            String busId ,
            String ticketId ,
            PassengerDetails passengerDetails){
        BusOperator bus = busOperatorRepository.findById(busId).get();
        TicketCost ticketCost = ticketCostRepository.findById(ticketId).get();


        String paymentIntent = createPaymentIntent(Double.valueOf(ticketCost.getCost()));

        if (paymentIntent!=null) {



            Booking booking =new Booking();
        String bookingId = UUID.randomUUID().toString();
        booking.setBusId(busId);
        booking.setTicketId(ticketId);
        booking.setBookingId(bookingId);
        booking.setTo(bus.getArrivalCity());
        booking.setFrom(bus.getDepartureCity());
        booking.setBusCompany(bus.getBusOperatorCompanyName());
        booking.setPrice(ticketCost.getCost());
        booking.setFirstName(passengerDetails.getFirstName());
        booking.setLastName(passengerDetails.getLastName());
        booking.setEmail(passengerDetails.getEmail());
        booking.setMobile(passengerDetails.getMobile());


            Booking ticketCreatedDetails = bookingRepository.save(booking);

            BookingDetailDto dto = new BookingDetailDto();
            dto.setBusId(ticketCreatedDetails.getBusId());
            dto.setTicketId(ticketCreatedDetails.getTicketId());
            dto.setTo(ticketCreatedDetails.getTo());
            dto.setFrom(ticketCreatedDetails.getFrom());
            dto.setBookingId(ticketCreatedDetails.getBookingId());
            dto.setFirstName(ticketCreatedDetails.getFirstName());
            dto.setLastName(ticketCreatedDetails.getLastName());
            dto.setPrice(ticketCreatedDetails.getPrice());
            dto.setEmail(ticketCreatedDetails.getEmail());
            dto.setMobile(ticketCreatedDetails.getMobile());
            dto.setBusCompany(ticketCreatedDetails.getBusCompany());
            dto.setMessage("Booking Conformed");


            return dto;
        }else {
            System.out.println("Error!1");
        }
        return null;
    }

    
    public String createPaymentIntent( double amount) {
        Stripe.apiKey = stripeApiKey;

        try {

            long amountInCents = (long) (amount * 100);

            PaymentIntent intent = PaymentIntent.create(
                    new PaymentIntentCreateParams.Builder()
                            .setCurrency("usd")
                            .setAmount(amountInCents)
                            .build()
            );
            return generateResponse(intent.getClientSecret());
        } catch (StripeException e) {
            // Handle failure
            return generateResponse("Error Creating Payment:" + e.getMessage());
        }
    }

    private String generateResponse(String clientSecret){
        return "{\"clientSecret\":\"" + clientSecret + "\"}";
    }
}

