package com.Redbus.redbus.operator.service.impl;


import com.Redbus.redbus.operator.entity.BusOperator;
import com.Redbus.redbus.operator.entity.TicketCost;
import com.Redbus.redbus.operator.payload.BusOperatorDto;
import com.Redbus.redbus.operator.repository.BusOperatorRepository;
import com.Redbus.redbus.operator.repository.TicketCostRepository;
import com.Redbus.redbus.operator.service.BusOperatorService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.UUID;

@Service
public class BusOperatorServiceImpl implements BusOperatorService{
    @Autowired
    private BusOperatorRepository busOperatorRepository;
    private  ModelMapper mapper;

    public BusOperatorServiceImpl(BusOperatorRepository busOperatorRepository, ModelMapper mapper, TicketCostRepository ticketCostRepository) {
        this.busOperatorRepository = busOperatorRepository;
        this.mapper = mapper;
        this.ticketCostRepository = ticketCostRepository;
    }

    private TicketCostRepository ticketCostRepository;


    @Override
    public BusOperatorDto scheduleBus(BusOperatorDto busOperatorDto){
        BusOperator busOperator=mapToEntity(busOperatorDto);

        TicketCost ticketCost =new TicketCost();
        ticketCost.setTicketId(busOperatorDto.getTicketCost().getTicketId());
        ticketCost.setCost(busOperatorDto.getTicketCost().getCost());
        ticketCost.setCode(busOperatorDto.getTicketCost().getCode());
        ticketCost.setDiscountAmount(busOperatorDto.getTicketCost().getDiscountAmount());

        busOperator.setTicketCost(ticketCost);


        String busId = UUID.randomUUID().toString();
        busOperator.setBusId(busId);

        BusOperator savedBusSchedule=busOperatorRepository.save(busOperator);
        return mapToDto(savedBusSchedule);

    }
    BusOperator mapToEntity(BusOperatorDto busOperatorDto){
        BusOperator busOperator=mapper.map(busOperatorDto, BusOperator.class);
        return busOperator;
    }
    BusOperatorDto mapToDto(BusOperator busOperator){
        BusOperatorDto busOperatorDto=mapper.map(busOperator, BusOperatorDto.class);
        return busOperatorDto;
    }
}
