package com.Redbus.redbus.user.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingDetailDto {

    private String bookingId;

    private String busId;

    private String ticketId;

    private String busCompany;

    private String to;

    private String from;

    private String firstName;

    private String lastName;

    private String email;

    private String mobile;

    private String price;

    private String message;
}
