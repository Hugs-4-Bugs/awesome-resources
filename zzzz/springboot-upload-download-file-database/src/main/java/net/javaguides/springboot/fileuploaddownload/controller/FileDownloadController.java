package net.javaguides.springboot.fileuploaddownload.controller;

import jakarta.servlet.http.HttpServletRequest;
import net.javaguides.springboot.fileuploaddownload.exception.FileNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import net.javaguides.springboot.fileuploaddownload.Entity.DatabaseFile;
import net.javaguides.springboot.fileuploaddownload.service.DatabaseFileService;




@RestController
public class FileDownloadController {

    @Autowired
    private DatabaseFileService fileStorageService;

      @GetMapping("/downloadFile/{id}")

    //@GetMapping("/downloadFile/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String id, HttpServletRequest request) {
        try {
            // Load file as Resource
            DatabaseFile databaseFile = fileStorageService.getFile(id);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(databaseFile.getFileType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + databaseFile.getFileName() + "\"")
                    .body(new ByteArrayResource(databaseFile.getData()));
        } catch (FileNotFoundException ex) {
            // Handle file not found exception
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ByteArrayResource(("File not found: " + id).getBytes()));
        } catch (Exception ex) {
            // Handle any other exceptions
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ByteArrayResource(("An error occurred: " + ex.getMessage()).getBytes()));
        }
    }
}
