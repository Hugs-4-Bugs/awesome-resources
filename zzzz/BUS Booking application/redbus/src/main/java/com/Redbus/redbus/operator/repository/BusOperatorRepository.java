package com.Redbus.redbus.operator.repository;

import com.Redbus.redbus.operator.entity.BusOperator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Date;
import java.util.List;

public interface BusOperatorRepository extends JpaRepository<BusOperator, String> {
    List<BusOperator> findByDepartureCityAndArrivalCityAndDepartureDate(@RequestParam String departureCity, String arrivalCity, Date departureDate);

    @Query("SELECT bo FROM BusOperator bo WHERE bo.departureCity = :departureCity AND bo.arrivalCity = :arrivalCity AND bo.departureDate=:departureDate")
    List<BusOperator> searchByCitiesAndDate(@Param("departureCity") String departureCity , @Param("arrivalCity") String arrivalCity , @Param("departureDate") String departureDate);
}
