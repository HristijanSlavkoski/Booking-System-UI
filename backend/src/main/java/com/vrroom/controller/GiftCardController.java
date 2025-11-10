// package com.vrroom.controller;
package com.vrroom.controller;

import com.vrroom.domain.entity.GiftCard;
import com.vrroom.dto.GiftCardPeekResponse;
import com.vrroom.exception.ResourceNotFoundException;
import com.vrroom.repository.GiftCardRepository;
import com.vrroom.service.GiftCardService;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/gift-cards")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${cors.allowed-origins}")
public class GiftCardController
{

    private final GiftCardService giftCardService;
    private final GiftCardRepository giftCardRepository;

    /**
     * Peek a gift card's usable discount amount without changing its status.
     * Frontend uses this to show "Gift card applied: -X MKD".
     */
    @GetMapping("/peek")
    public ResponseEntity<GiftCardPeekResponse> peek(@RequestParam("code") String code)
    {
        log.info("Peeking gift card with code {}", code);

        // Let the service do validation & amount logic.
        // If invalid/used/expired, it should throw some kind of exception which you can map to 400/404.
        BigDecimal amount = giftCardService.peekDiscount(code);

        GiftCard card = giftCardRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Gift card not found"));

        GiftCardPeekResponse dto = GiftCardPeekResponse.builder()
                .code(card.getCode())
                .amount(amount)
                .status(card.getStatus())
                .build();

        return ResponseEntity.ok(dto);
    }
}
