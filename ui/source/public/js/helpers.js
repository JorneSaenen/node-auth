// Base URL for post requests to API server
export const baseUrl = "https://api.nodeauth.dev";

// Get values Function
export const getValues = (form) => {
  return Object.values(form).reduce((obj, field) => {
    if (field.name) {
      obj[field.name] = field.value;
    }
    return obj;
  }, {});
};
