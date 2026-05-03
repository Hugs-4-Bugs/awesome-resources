package com.library.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.library.entity.LibraryMember;
import com.library.repository.LibraryMemberRepository;

@Service
public class LibraryMemberService {
	@Autowired
	private LibraryMemberRepository libraryMemberRepository;
	
	public LibraryMember createLibraryMember(LibraryMember member) {
	    return libraryMemberRepository.save(member);
	}
	
	public List<LibraryMember> getAllLibraryMembers() {
	    return libraryMemberRepository.findAll();
	}
	
	public Optional<LibraryMember> getLibraryMemberById(Long id) {
	    return libraryMemberRepository.findById(id);
	}
	
	public LibraryMember updateLibraryMember(Long id, LibraryMember updatedMember) {
	    
	    Optional<LibraryMember> existingMember = libraryMemberRepository.findById(id);
	    
	    if (existingMember.isPresent()) {
	        updatedMember.setId(id); 
	        return libraryMemberRepository.save(updatedMember);
	    } else {
	        throw new RuntimeException("Library member not found with ID: " + id);
	    }
	}
	
	public void deleteLibraryMember(Long id) {
	    
	    if (libraryMemberRepository.existsById(id)) {
	        libraryMemberRepository.deleteById(id);
	    } else {
	        throw new RuntimeException("Library member not found with ID: " + id);
	    }
	}

}
