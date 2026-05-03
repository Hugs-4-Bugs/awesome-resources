package com.stripe.stripepayment.Controller;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.stripepayment.Dto.OrderDTO;
import com.stripe.stripepayment.Service.OrderService;
import com.stripe.stripepayment.Service.OrderServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    @Value("${stripe.apiKey}") // Accessing the API key
    private String stripeApiKey;

    private final OrderService orderService;

    @Autowired
    public PaymentController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Endpoint for creating a payment and saving the order
    @PostMapping
    public ResponseEntity<ByteArrayResource> makePayment(@RequestBody OrderDTO orderDTO) {
        try {
            // Initialize Stripe with the API key
            Stripe.apiKey = stripeApiKey;

            // Set payment parameters based on OrderDTO
            PaymentIntentCreateParams createParams = new PaymentIntentCreateParams.Builder()
                    .setCurrency("usd")
                    .setAmount(orderDTO.getAmount())
                    .setDescription(orderDTO.getDescription())
                    .build();

            // Create the payment intent with Stripe
            PaymentIntent paymentIntent = PaymentIntent.create(createParams);

            // Save the order to the database
            orderService.saveOrder(orderDTO);

            // Generate PDF receipt
            ByteArrayResource pdfReceipt = ((OrderServiceImpl) orderService).generatePdfReceipt(orderDTO, paymentIntent.getId());

            // Set headers for PDF download
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=payment_receipt.pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfReceipt);

        } catch (StripeException e) {
            // Handle Stripe errors and respond with an error message
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        } catch (IOException e) {
            // Handle PDF generation errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
