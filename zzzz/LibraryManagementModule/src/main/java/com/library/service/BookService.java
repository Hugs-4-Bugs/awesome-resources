package com.library.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.library.entity.Book;
import com.library.repository.BookRepository;

@Service
public class BookService {
	@Autowired
	private BookRepository bookRepository;
	
	public Book createBook(Book book) {
	    return bookRepository.save(book);
	}

	public List<Book> getAllBooks() {
	    return bookRepository.findAll();
	}

	public Optional<Book> getBookById(Long id) {
	    return bookRepository.findById(id);
	}
	
	public Book updateBook(Long id, Book updatedBook) {
	    
	    Optional<Book> existingBook = bookRepository.findById(id);
	    
	    if (existingBook.isPresent()) {
	        updatedBook.setId(id); 
	        return bookRepository.save(updatedBook);
	    } else {
	        throw new RuntimeException("Book not found with ID: " + id);
	    }
	}
	
	public void deleteBook(Long id) {
	    
	    if (bookRepository.existsById(id)) {
	        bookRepository.deleteById(id);
	    } else {
	        throw new RuntimeException("Book not found with ID: " + id);
	    }
	}

}
