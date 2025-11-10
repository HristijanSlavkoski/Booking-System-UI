// package com.vrroom.dto;
package com.vrroom.dto;

import com.vrroom.domain.enums.GiftCardStatus;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GiftCardPeekResponse
{
    private String code;
    private BigDecimal amount;
    private GiftCardStatus status;
}
