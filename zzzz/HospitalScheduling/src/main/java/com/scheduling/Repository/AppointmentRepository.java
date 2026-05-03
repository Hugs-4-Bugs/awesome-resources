package com.scheduling.Repository;


import com.scheduling.Entity.Appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByAppointmentDateBetweenAndReminderSentFalse(LocalDateTime start, LocalDateTime end);


}
