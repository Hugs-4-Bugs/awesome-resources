package com.scheduling.ScheduledTaskService;



import com.scheduling.Entity.Appointment;
import com.scheduling.Repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScheduledTaskService {

    @Autowired
    private AppointmentRepository repository;

    @Scheduled(cron = "0 0 * * * ?") // Runs every hour
    public void sendAppointmentReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourLater = now.plusHours(1);

        // Find appointments scheduled within the next hour
        List<Appointment> appointments = repository.findByAppointmentDateBetweenAndReminderSentFalse(now, oneHourLater);

        for (Appointment appointment : appointments) {
            // Simulate sending a reminder
            System.out.println("Reminder: Appointment for " + appointment.getPatientName() +
                    " with Dr. " + appointment.getDoctorName() +
                    " at " + appointment.getAppointmentDate());

            // Mark reminder as sent
            appointment.setReminderSent(true);
            repository.save(appointment);
        }
    }
}
