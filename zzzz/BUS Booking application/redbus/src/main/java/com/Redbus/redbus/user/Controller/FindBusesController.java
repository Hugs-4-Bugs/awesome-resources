package com.Redbus.redbus.user.Controller;

import com.Redbus.redbus.operator.entity.BusOperator;
import com.Redbus.redbus.user.payload.BusListDto;
import com.Redbus.redbus.user.service.SearchBusesService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/user")
public class FindBusesController {

    public FindBusesController(SearchBusesService searchBusesService) {
        this.searchBusesService = searchBusesService;
    }

    private SearchBusesService searchBusesService;

     //    http://localhost:8080/api/user/Buses?departureCity=CityA&arrivalCity=CityB&departureDate=2023-01-01
    @GetMapping("/searchBuses")
    public List<BusListDto> searchBuses(
            @RequestParam ("departureCity")String departureCity,
            @RequestParam ("arrivalCity") String arrivalCity ,
            @RequestParam ("departureDate") @DateTimeFormat(pattern = "dd/MM/yyyy") Date departureDate){
        List<BusListDto> busListDtos = searchBusesService.searchBusBy(departureCity, arrivalCity, departureDate);
        return busListDtos;
    }
}
