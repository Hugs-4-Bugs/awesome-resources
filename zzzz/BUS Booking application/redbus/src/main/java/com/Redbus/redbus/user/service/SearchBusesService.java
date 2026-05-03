package com.Redbus.redbus.user.service;

import com.Redbus.redbus.operator.entity.BusOperator;
import com.Redbus.redbus.operator.payload.BusOperatorDto;
import com.Redbus.redbus.operator.repository.BusOperatorRepository;
import com.Redbus.redbus.user.payload.BusListDto;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchBusesService {

    public SearchBusesService(BusOperatorRepository busOperatorRepository) {
        this.busOperatorRepository = busOperatorRepository;
    }

    private BusOperatorRepository busOperatorRepository;

    public List<BusListDto> searchBusBy(@RequestParam String departureCity, String arrivalCity , Date departureDate){
        List<BusOperator> busesAvailable = busOperatorRepository.findByDepartureCityAndArrivalCityAndDepartureDate(departureCity, arrivalCity, departureDate);
        List<BusListDto> dtos = busesAvailable.stream().map(bus -> mapToDto(bus)).collect(Collectors.toList());
        return dtos;
    }


    BusListDto mapToDto(BusOperator busOperator){
        BusListDto busListDto = new BusListDto();
        busListDto.setBusId(busOperator.getBusId());
        busListDto.setBusNumber(busOperator.getBusNumber());
        busListDto.setDepartureDate(busOperator.getDepartureDate());
        busListDto.setArrivalDate(busOperator.getArrivalDate());
        busListDto.setBusOperatorCompanyName(busOperator.getBusOperatorCompanyName());
        busListDto.setNumberOfSeats(busOperator.getBusNumber());
        busListDto.setDepartureCity(busOperator.getDepartureCity());
        busListDto.setArrivalCity(busOperator.getArrivalCity());
        busListDto.setDepartureTime(busOperator.getDepartureTime());
        busListDto.setArrivalTime(busOperator.getArrivalTime());
        busListDto.setBusType(busOperator.getBusType());
        busListDto.setTotalTravelTime(busOperator.getTotalTravelTime());
        busListDto.setAmenities(busOperator.getAmenities());
        return busListDto;
    }
}
