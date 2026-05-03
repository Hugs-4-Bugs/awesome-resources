package com.whatsapp.whatsapp.api.Controller;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import com.whatsapp.whatsapp.api.Payload.WhatsAppMessageRequest;
import com.whatsapp.whatsapp.api.config.TwilioConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WhatsAppController {

    private final TwilioConfiguration twilioConfiguration;

    @Autowired
    public WhatsAppController(TwilioConfiguration twilioConfiguration) {
        this.twilioConfiguration = twilioConfiguration;
    }
    //http://localhost:8080/send-whatsapp
    @PostMapping("/send-whatsapp")
    public String sendWhatsAppMessage(@RequestBody WhatsAppMessageRequest request) {
        Message message = Message.creator(
                new PhoneNumber("+14155238886" + request.getRecipientNumber()),
                new PhoneNumber(twilioConfiguration.getPhoneNumber()),
                request.getMessage()
        ).create();

        return "WhatsApp message sent with SID: " + message.getSid();
    }
}
