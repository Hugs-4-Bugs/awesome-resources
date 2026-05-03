package com.Redbus.redbus.operator.service;

import com.Redbus.redbus.operator.entity.BusOperator;
import com.Redbus.redbus.operator.payload.BusOperatorDto;

import java.util.List;

public interface BusOperatorService {

    BusOperatorDto scheduleBus(BusOperatorDto busOperatorDto);

}

