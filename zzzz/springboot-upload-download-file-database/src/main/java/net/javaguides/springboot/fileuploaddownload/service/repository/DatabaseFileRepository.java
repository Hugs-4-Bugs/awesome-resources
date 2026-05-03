package net.javaguides.springboot.fileuploaddownload.service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import net.javaguides.springboot.fileuploaddownload.Entity.DatabaseFile;

public interface DatabaseFileRepository extends JpaRepository<DatabaseFile, String> {
    Optional<DatabaseFile> findByFileName(String fileName); // Method to find file by name
}
