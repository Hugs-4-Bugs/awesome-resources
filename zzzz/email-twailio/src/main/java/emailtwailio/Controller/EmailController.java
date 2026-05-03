package emailtwailio.Controller;




import emailtwailio.Payload.EmailRequest;
import emailtwailio.Service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
public class EmailController {

    private final EmailService emailService;

    @Autowired
    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/send-email")
    public void sendEmail(@RequestBody EmailRequest emailRequest) throws IOException {
        emailService.sendEmail(emailRequest.getToEmail(), emailRequest.getSubject(), emailRequest.getContent());
    }
}

