package com.Redbus.redbus.operator.controller;

import com.Redbus.redbus.operator.payload.BusOperatorDto;
import com.Redbus.redbus.operator.service.BusOperatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/buses")
public class BusOperatorController {
    @Autowired
    private BusOperatorService busOperatorService;

    public BusOperatorController(BusOperatorService busOperatorService) {
        this.busOperatorService = busOperatorService;
    }


    //http://localhost:8080/api/bus
    @PostMapping
    public ResponseEntity<BusOperatorDto> scheduleBus(@RequestBody BusOperatorDto busOperatorDto) {
        BusOperatorDto dto = busOperatorService.scheduleBus(busOperatorDto);
        return new ResponseEntity<>(dto,HttpStatus.CREATED);
    }
}
