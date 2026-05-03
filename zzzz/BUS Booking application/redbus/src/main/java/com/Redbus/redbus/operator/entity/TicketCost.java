package com.Redbus.redbus.operator.entity;

import com.Redbus.redbus.operator.payload.BusOperatorDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Generated;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Table(name = "ticket_cost")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketCost {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private String id;

    @Column(name = "ticket_id" , unique = true)
    private String ticketId;

    @OneToOne(mappedBy = "ticketCost")
    @JoinColumn(name = "bus_id")
    private BusOperator busOperator;

    private String cost;
    private String code;

    @Column(name = "discount_amount" , unique = true)
    private double discountAmount  ;


}
