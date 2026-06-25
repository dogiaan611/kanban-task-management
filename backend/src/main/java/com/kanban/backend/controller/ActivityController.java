package com.kanban.backend.controller;
import com.kanban.backend.dto.response.ActivityResponse;
import com.kanban.backend.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {
    private final ActivityService activityService;

    @GetMapping("/card/{cardId}")
    public ResponseEntity<List<ActivityResponse>> getActivitiesByCard(@PathVariable Long cardId, Authentication authentication) {
        return ResponseEntity.ok(activityService.getActivitiesByCard(cardId, authentication.getName()));
    }
}
