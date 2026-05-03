package com.library.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.library.entity.LibraryMember;
import com.library.service.LibraryMemberService;

@RestController
@RequestMapping("/api/library-members")
public class LibraryMemberController {
	@Autowired
    private LibraryMemberService libraryMemberService;
	
	@PostMapping
	public LibraryMember createLibraryMember(@RequestBody LibraryMember member) {
	    return libraryMemberService.createLibraryMember(member);
	}
	
	@GetMapping
	public List<LibraryMember> getAllLibraryMembers() {
	    return libraryMemberService.getAllLibraryMembers();
	}
	
	@GetMapping("/{id}")
	public Optional<LibraryMember> getLibraryMemberById(@PathVariable Long id) {
	    return libraryMemberService.getLibraryMemberById(id);
	}
	
	@PutMapping("/{id}")
	public LibraryMember updateLibraryMember(@PathVariable Long id, @RequestBody LibraryMember updatedMember) {
	    return libraryMemberService.updateLibraryMember(id, updatedMember);
	}
	
	@DeleteMapping("/{id}")
	public void deleteLibraryMember(@PathVariable Long id) {
	    libraryMemberService.deleteLibraryMember(id);
	}

}
