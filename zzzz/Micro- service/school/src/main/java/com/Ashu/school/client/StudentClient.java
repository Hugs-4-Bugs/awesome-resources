package com.Ashu.school.client;


import com.Ashu.school.student;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "studentClient", url = "${application.config.students-url}") // Update the property name
public interface StudentClient {

    @GetMapping("/students/by-school/{schoolId}")
    List<student> findAllStudentsBySchool(@PathVariable("schoolId") Integer schoolId);
}

