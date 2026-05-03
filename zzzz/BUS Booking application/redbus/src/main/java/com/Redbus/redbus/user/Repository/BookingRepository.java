package com.Redbus.redbus.user.Repository;

import com.Redbus.redbus.user.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking ,String> {
}
