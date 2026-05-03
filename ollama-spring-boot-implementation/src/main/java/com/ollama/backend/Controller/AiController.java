package com.ollama.backend.Controller;

import com.ollama.backend.Service.AiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/v1/ai")
public class AiController {
    private final AiService aiService;

    public AiController(AiService aiService){
        this.aiService = aiService;
    }
    // this will take some time. first it will think and gather the information then will give response
    @GetMapping
    public ResponseEntity<String> askAi(
            @RequestParam(value = "query", required = false, defaultValue = "How are you? How can i help you?") String query
    ){
        String response = aiService.askAi(query);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // this will give the fast response or also may give the response with chunk of information
    @GetMapping("/stream")
    public Flux<String> streamAi(
            @RequestParam(value = "query", required = false, defaultValue = "How are you? How can i help you?") String query
    ){
        return aiService.streamResponse(query);
    }
}


























//package com.ollama.backend.Controller;
//
//import com.ollama.backend.Service.AiService;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//import reactor.core.publisher.Flux;
//
//@RestController
//@RequestMapping("/api/v1/ai")
//public class AiController {
//    private AiService aiService;
//
//    public AiController(AiService aiService){
//        this.aiService = aiService;
//    }
//    // this will take some time. first it will think and gather the information then will give response
//    @GetMapping
//    public ResponseEntity<String> askAi(
//            @RequestParam(value = "query", required = false, defaultValue = "How are you? How can i help you?") String query
//    ){
//
//        String response = aiService.askAi(query);
//        return new ResponseEntity<>(response, HttpStatus.OK);
//
//    }
//
//    // this will give the fast response or also mag give the response with chunck of information
//    @GetMapping("/stream")
//    public Flux<String> streamAi(
//            @RequestParam(value = "query", required = false, defaultValue = "How are you? How can i help you?") String query
//    ){
//
//        return aiService.streamResponse(query);
//    }
//}
