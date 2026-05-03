package com.whatsapp.whatsapp.api.Payload;


public class WhatsAppMessageRequest {

    private String recipientNumber;
    private String message;

    public String getRecipientNumber() {
        return recipientNumber;
    }

    public void setRecipientNumber(String recipientNumber) {
        this.recipientNumber = recipientNumber;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
