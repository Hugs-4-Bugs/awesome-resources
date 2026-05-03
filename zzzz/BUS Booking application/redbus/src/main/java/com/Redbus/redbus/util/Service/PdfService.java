package com.Redbus.redbus.util.Service;

import com.Redbus.redbus.user.payload.BookingDetailDto;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class PdfService {

    public byte[] generatePdf(BookingDetailDto bookingDetailDto){
        try(ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer =new PdfWriter(outputStream);
        PdfDocument pdfDocument =new PdfDocument(writer)){

            try(Document document = new Document(pdfDocument)){
                document.add(new Paragraph("Booking Details"));
                document.add(new Paragraph("Booking ID: " + bookingDetailDto.getBookingId()));
                document.add(new Paragraph("Bus ID: " + bookingDetailDto.getBusId()));
                document.add(new Paragraph("Ticket ID: " + bookingDetailDto.getTicketId()));
                document.add(new Paragraph("Bus Company: " + bookingDetailDto.getBusCompany()));
                document.add(new Paragraph("From: " + bookingDetailDto.getFrom()));
                document.add(new Paragraph("To: " + bookingDetailDto.getTo()));
                document.add(new Paragraph("First Name: " + bookingDetailDto.getFirstName()));
                document.add(new Paragraph("Last Name: " + bookingDetailDto.getLastName()));
                document.add(new Paragraph("Email: " + bookingDetailDto.getEmail()));
                document.add(new Paragraph("Mobile: " + bookingDetailDto.getMobile()));
                document.add(new Paragraph("Price: " + bookingDetailDto.getPrice()));

            }

            return outputStream.toByteArray();
        } catch (IOException e) {
          e.printStackTrace();
          return null;
        }
    }
}
