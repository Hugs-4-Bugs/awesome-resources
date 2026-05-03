package com.Redbus.redbus.operator.payload;

import com.Redbus.redbus.operator.entity.TicketCost;
import com.Redbus.redbus.operator.util.CustomLocalTimeDeserializer;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import java.time.LocalTime;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BusOperatorDto {
    @JsonDeserialize(using = CustomLocalTimeDeserializer.class)

    private String busId;
    private String busNumber;
    private String busOperatorCompanyName;
    private String driverName;
    private String supportStaff;
    private String numberOfSeats;
    private String departureCity;
    private String arrivalCity;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime departureTime;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime arrivalTime;

    @JsonFormat(pattern = "dd/MM/yyyy")
    @Temporal(TemporalType.DATE)
    private Date departureDate;


    @JsonFormat(pattern = "dd/MM/yyyy")
    @Temporal(TemporalType.DATE)
    private Date arrivalDate;

    private double totalTravelTime;
    private String busType;
    private String amenities;

    private TicketCost ticketCost;


}

