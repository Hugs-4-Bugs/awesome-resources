package com.Redbus.redbus.operator.entity;
import com.Redbus.redbus.operator.util.CustomLocalTimeDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalTime;
import java.util.Date;

@Entity
@Table(name = "bus_operator")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BusOperator {

    @Id
    @Column(name = "bus_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String busId;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "bus_id")
    private TicketCost ticketCost;

    @Column(name = "bus_number")
    private String busNumber;

    @Column(name = "bus_operator_company_name")
    private String busOperatorCompanyName;

    @Column(name = "driver_name")
    private String driverName;

    @Column(name = "support_staff")
    private String supportStaff;


    @Column(name = "number_of_seats")
    private int numberOfSeats;

    @Column(name = "departure_city")
    private String departureCity;

    @Column(name = "arrival_city")
    private String arrivalCity;

    //@JsonFormat(pattern = "HH:mm:ss")
    @Column(name = "departure_time")
    private LocalTime departureTime;


    //@JsonFormat(pattern = "HH:mm:ss")
    @Column(name = "arrival_time")
    private LocalTime arrivalTime;


    @Temporal(TemporalType.DATE)
    @Column(name = "departure_date")
    @JsonDeserialize(using = CustomLocalTimeDeserializer.class)
    private Date departureDate;


    @Temporal(TemporalType.DATE)
    @Column(name = "arrival_date")
    @JsonDeserialize(using = CustomLocalTimeDeserializer.class)
    private Date arrivalDate;


    @Column(name = "total_travel_time")
    private double totalTravelTime;

    @Column(name = "bus_type")
    private String busType;

    @Column(name = "amenities")
    private String amenities;

}
