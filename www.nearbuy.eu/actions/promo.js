export const setCurrentPromo = currentPromo => {
    return { type: "CURRENT_PROMO", payload: currentPromo};
  }
  
export const setCardIndex = cardIndex => {
    return { type: "CARD_INDEX", payload: cardIndex};
  }