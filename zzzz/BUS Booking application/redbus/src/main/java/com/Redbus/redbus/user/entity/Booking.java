package com.Redbus.redbus.user.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Table(name = "bookings")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Booking {

    @Id
    @Column(name = "booking_id")
    private String bookingId;

    @Column(name = "bus_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String busId;

    @Column(name = "ticket_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String ticketId;

    @Column(name = "bus_company")
    private String busCompany;

    @Column(name = "`to`")
    private String to;

    @Column(name = "`from`")
    private String from;


    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "email")
    private String email;

    @Column(name = "mobile")
    private String mobile;

    @Column(name = "price")
    private String price;
}
