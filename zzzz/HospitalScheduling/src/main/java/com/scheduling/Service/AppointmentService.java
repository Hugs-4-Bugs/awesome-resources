package com.scheduling.Service;

import com.scheduling.Entity.Appointment;
import com.scheduling.Repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository repository;

    public List<Appointment> getAllAppointments() {
        return repository.findAll();
    }

    public Appointment createAppointment(Appointment appointment) {
        return repository.save(appointment);
    }
}
