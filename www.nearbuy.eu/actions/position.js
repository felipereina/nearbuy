
export const updateCurrentPosition = position => {
  return { type: "CURRENT_POSITION", payload: position };
};

export const updateReferencePoint = reference => {
  return { type: "REFERENCE_POINT", payload: reference };
};
