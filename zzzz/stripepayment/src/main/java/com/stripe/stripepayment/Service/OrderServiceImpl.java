package com.stripe.stripepayment.Service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import com.itextpdf.layout.properties.TextAlignment;
import org.springframework.core.io.ByteArrayResource;


import com.stripe.stripepayment.Dto.OrderDTO;
import com.stripe.stripepayment.entity.Order;
import com.stripe.stripepayment.repository.OrderRepository;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ModelMapper modelMapper;


    public OrderServiceImpl(OrderRepository orderRepository, ModelMapper modelMapper) {
        this.orderRepository = orderRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public OrderDTO saveOrder(OrderDTO orderDTO) {
        Order order = modelMapper.map(orderDTO, Order.class);
        Order savedOrder = orderRepository.save(order);
        return modelMapper.map(savedOrder, OrderDTO.class);
    }

    public ByteArrayResource generatePdfReceipt(OrderDTO orderDTO, String paymentId) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);


        // Add payment details
        document.add(new Paragraph("Payment ID: " + paymentId));
        document.add(new Paragraph("Order Amount: $" + (orderDTO.getAmount() / 100.0))); // Convert cents to dollars
        document.add(new Paragraph("Description: " + orderDTO.getDescription()));

        // Closing document
        document.close();

        return new ByteArrayResource(baos.toByteArray());

    }
}