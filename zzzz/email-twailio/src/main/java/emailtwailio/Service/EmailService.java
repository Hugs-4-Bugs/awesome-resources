package emailtwailio.Service;

import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import com.sendgrid.SendGrid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class EmailService {

    private final SendGrid sendGrid;

    @Value("${sendgrid.sender.email}")
    private String senderEmail;

  @Autowired
    public EmailService(SendGrid sendGrid) {
        this.sendGrid = sendGrid;
    }

    public void sendEmail(String toEmail, String subject, String content) throws IOException {
        Email from = new Email(senderEmail);
        Email to = new Email(toEmail);
        Content mailContent = new Content("text/plain", content);

        Mail mail = new Mail();
        mail.setFrom(from);
        mail.setSubject(subject);
        mail.addContent(mailContent);

        Personalization personalization = new Personalization();
        personalization.addTo(to);
        mail.addPersonalization(personalization);

        com.sendgrid.Request request = new com.sendgrid.Request();
        request.setMethod(com.sendgrid.Method.POST);
        request.setEndpoint("mail/send");
        request.setBody(mail.build());

        com.sendgrid.Response response = sendGrid.api(request);
        if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
            System.out.println("Email sent successfully to " + toEmail);
        } else {
            System.err.println("Failed to send email to " + toEmail);
        }
    }
}
