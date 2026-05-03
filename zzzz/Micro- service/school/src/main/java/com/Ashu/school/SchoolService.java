package com.Ashu.school;

import com.Ashu.school.client.StudentClient;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SchoolService {

    private final SchoolRepository repository;
    private final StudentClient client;

    public SchoolService(SchoolRepository repository, StudentClient client) {
        this.repository = repository;
        this.client = client;
    }

    public void saveSchool(School school) {
        repository.save(school);
    }

    public List<student> findStudentsBySchool(Integer schoolId) {
        return client.findAllStudentsBySchool(schoolId);
    }

    public FullSchoolResponse findSchoolsWithStudents(Integer schoolId) {
        var school = repository.findById(schoolId)
                .orElse(
                        School.builder()
                                .name("NOT_FOUND")
                                .email("NOT_FOUND")
                                .build()
                );
        var students = findStudentsBySchool(schoolId);
        return FullSchoolResponse.builder()
                .name(school.getName())
                .email(school.getEmail())
                .students(students)
                .build();
    }
}
